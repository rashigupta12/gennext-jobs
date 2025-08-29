import { Role } from "@/validaton-schema";

export type RegisterFormProps = {
  text: string;
  role: Role;
};

export interface PasswordChangeScreenProps {
  userId: string;
  isFirstTime?: boolean;
}

export type PasswordField = 'current' | 'new' | 'confirm';