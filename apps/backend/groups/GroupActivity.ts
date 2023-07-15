import { Subject } from "rxjs";
import { IGroupActivity } from "schooltalk-shared/group-schemas";

export const AllGroupActivitiesObservable = new Subject<IGroupActivity>();
