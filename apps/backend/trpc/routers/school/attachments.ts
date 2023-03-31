import { t, authMiddleware } from "../../trpc";
import { generateSignedS3URL } from "../../../utils/file.service";

const attachmentsRouter = t.router({
  requestPermission: t.procedure
    .use(authMiddleware)
    .mutation(({ ctx }) => generateSignedS3URL(ctx.user.id)),
});

export default attachmentsRouter;
