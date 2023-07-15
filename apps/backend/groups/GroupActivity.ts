import { z } from "zod";
import { Subject } from "rxjs";
import type { GroupActivity as DBGroupActivity } from "@prisma/client";
import { ActivityPayloadSchema } from "schooltalk-shared/group-schemas";

interface IGroupActivity extends DBGroupActivity {
  payload: z.infer<typeof ActivityPayloadSchema>;
}

export const AllGroupActivitiesObservable = new Subject<IGroupActivity>();
