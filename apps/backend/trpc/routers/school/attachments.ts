import { TRPCError } from "@trpc/server";
import { addSeconds } from "date-fns";
import { t, authMiddleware } from "../../trpc";
import {
  generateSignedDownloadS3URL,
  generateSignedUploadS3URL,
} from "../../../utils/file.service";
import { z } from "zod";
import prisma from "../../../prisma";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import config from "../../../config";
import { imagekit, s3client } from "../../../utils/aws-clients";

const attachmentsRouter = t.router({
  requestPermission: t.procedure
    .use(authMiddleware)
    .input(
      z.object({
        file_name: z.string().optional(),
        size_in_bytes: z.number().optional(),
        mime: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const data = await generateSignedUploadS3URL(ctx.user.id);

      // Update the given file name and size
      const permission = await prisma.fileUploadPermission.update({
        where: { id: data.permission.id },
        data: {
          file_name: input.file_name,
          size_bytes: input.size_in_bytes,
          mime: input.mime,
        },
      });

      return { ...data, permission };
    }),
  cancelPermission: t.procedure
    .use(authMiddleware)
    .input(
      z.object({
        permission_id: z.string().cuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Check the permission
      const permission = await prisma.fileUploadPermission.findUnique({
        where: { id: input.permission_id },
      });

      if (
        !permission ||
        permission.user_id !== ctx.user.id ||
        permission.school_id !== ctx.user.school_id
      )
        throw new TRPCError({
          code: "NOT_FOUND",
        });

      // Delete the permission
      await prisma.fileUploadPermission.delete({
        where: { id: input.permission_id },
      });

      // Attempt to delete from S3
      const deleteCommand = new DeleteObjectCommand({
        Bucket: config.S3_USERCONTENT_BUCKET,
        Key: permission.s3key,
      });

      // Attempt delete, but ignore when it fails
      await s3client.send(deleteCommand).catch(() => null);
    }),
  fetchFile: t.procedure
    .use(authMiddleware)
    .input(
      z.object({
        file: z.union([z.string().cuid(), z.object({ id: z.string().cuid() })]),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Check existence of file
      const file = await prisma.uploadedFile.findUnique({
        where: {
          id: typeof input.file === "string" ? input.file : input.file.id,
        },
      });

      if (!file || file.school_id !== ctx.user.school_id)
        throw new TRPCError({
          code: "NOT_FOUND",
        });

      return file;
    }),
  getFileURL: t.procedure
    .use(authMiddleware)
    .input(
      z.object({
        file_id: z.string().cuid(),
        via_imagekit: z.boolean().default(false),
        imagekit_transformations: z.record(z.string()).array().default([]),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Check existence of file
      const file = await prisma.uploadedFile.findUnique({
        where: {
          id: input.file_id,
        },
      });

      if (!file || file.school_id !== ctx.user.school_id)
        throw new TRPCError({
          code: "NOT_FOUND",
        });

      if (input.via_imagekit) {
        return {
          url: imagekit.url({
            path: file.s3key,
            signed: true,
            expireSeconds: config.S3_DOWNLOAD_URL_EXPIRY_SECONDS,
            transformation: input.imagekit_transformations,
          }),
          expiry: addSeconds(new Date(), config.S3_DOWNLOAD_URL_EXPIRY_SECONDS),
        };
      } else {
        // Generate signed s3 URL
        return generateSignedDownloadS3URL(file.s3key);
      }
    }),
});

export default attachmentsRouter;
