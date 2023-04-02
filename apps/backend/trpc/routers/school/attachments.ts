import { t, authMiddleware } from "../../trpc";
import {
  generateSignedDownloadS3URL,
  generateSignedUploadS3URL,
} from "../../../utils/file.service";
import { z } from "zod";
import prisma from "../../../prisma";
import { TRPCError } from "@trpc/server";

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
      const permission = await generateSignedUploadS3URL(ctx.user.id);

      // Update the given file name and size
      await prisma.fileUploadPermission.update({
        where: { id: permission.permission.id },
        data: {
          file_name: input.file_name,
          size_bytes: input.size_in_bytes,
          mime: input.mime,
        },
      });

      return permission;
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

      // Generate signed s3 URL
      return generateSignedDownloadS3URL(file.s3key);
    }),
});

export default attachmentsRouter;
