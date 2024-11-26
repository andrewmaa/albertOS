import { Id } from "./_generated/dataModel";

export interface Course {
  _id: string;
  _creationTime?: number;
  name: string;
  code: string;
  instructor: string;
  schedule: string;
  location: string;
  courseType: string;
  section: string;
  classNumber: string;
  description: string;
  subjectCode: string;
  capacity: number;
  enrolled: number;
}

export interface CartItem extends Omit<Course, '_id'> {
  _id: Id<"cart">;
  _creationTime: number;
  userId: Id<"users">;
  courseId: string;
} 