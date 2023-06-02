import _ from "lodash";
import { router, protectedProcedure } from "../trpc";

const profileRouter = router({
  me: protectedProcedure.query(({ ctx }) =>
    _.omit(ctx.user, ["password", "otp", "otp_expiry", "School"]),
  ),
});

export default profileRouter;
