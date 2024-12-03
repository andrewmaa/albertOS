import { Id } from "./_generated/dataModel";

export interface Course {
  _id: string;
  name: string;
  code: string;
  description: string;
  sections: {
    instructor: string;
    schedule: string;
    location: string;
    courseType: string;
    section: string;
    classNumber: string;
    status: string;
  }[];
}

export interface CartItem extends Omit<Course, '_id'> {
  _id: Id<"cart">;
  _creationTime: number;
  userId: Id<"users">;
  courseId: string;
} 