export enum Status {
  Todo = 'Todo',
  Doing = 'Doing',
  ToReview = 'ToReview',
  Done = 'Done',
  Canceled = 'Canceled',
}
export class Task {
  id: string;
  title: string;
  desc?: string;
  priority: number; //  0:'low', 1:'medium', 2:'high'
  status: Status;
  createdAt?: Date;
  doneAt?: Date;
}
