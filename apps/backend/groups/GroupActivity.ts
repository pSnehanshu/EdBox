import { Subject } from "rxjs";
import { IGroupActivity } from "schooltalk-shared/types";

export const AllGroupActivitiesObservable = new Subject<IGroupActivity>();
