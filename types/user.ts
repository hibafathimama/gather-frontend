export interface UserType {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "organizer" | "admin";
}