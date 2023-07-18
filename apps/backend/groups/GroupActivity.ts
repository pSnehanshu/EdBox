import { Subject } from "rxjs";
import { IGroupActivity } from "schooltalk-shared/types";

export const GroupActivities$ = new Subject<IGroupActivity>();
