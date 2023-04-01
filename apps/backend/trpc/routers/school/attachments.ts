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
    .mutation(({ ctx }) => generateSignedUploadS3URL(ctx.user.id)),
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
