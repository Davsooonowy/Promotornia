import { z } from "zod"
import { UserRole } from "./enums"
interface NavigationItem {
  href: string
  text: string
}

const passwordValidation = z.string().min(4, { message: "Hasło za krótkie" })

const LoginFormDataSchema = z.object({
  email: z.string().email({ message: "Niepoprawny email" }),
  password: passwordValidation,
})

const PasswordFormDataSchema = z
  .object({
    newPassword: passwordValidation,
    repeatedNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.repeatedNewPassword, {
    message: "Hasła się nie zgadzają",
    path: ["repeatedNewPassword"],
  })

type LoginFormData = z.infer<typeof LoginFormDataSchema>

interface JwtPayload {
  user_id: number
  role: UserRole
}

const NewUserScheme = z.object({
  key: z.number(),
  email: z.string().email({ message: "Niepoprawny email" }),
})

type NewUser = z.infer<typeof NewUserScheme> & {
  emailError: string | null
}

interface FieldOfStudy {
  id: number
  name: string
  description: string
}

export interface Tag {
  id: number
  name: string
}

interface ThesisStudent {
  id: number
  name: string
  surname: string
  email: string
}

type ThesisStatus =
  | "Ukryty"
  | "Dostępny"
  | "Zarezerwowany"
  | "Student zaakceptowany"
  | "Zatwierdzony"

interface ThesisDetails {
  id: number
  title: string
  supervisor: string
  supervisorId: number
  fieldOfStudy: FieldOfStudy
  description: string
  prerequisitesDescription: string
  status: ThesisStatus
  tags: Tag[]
  reservedBy: ThesisStudent | null
  createdAt: string
}

interface ThesisBackend {
  id: number
  name: string
  description: string
  prerequisites: string
  field_of_study: FieldOfStudy
  tags: Tag[]
  owner: {
    first_name: string
    last_name: string
    id: number
  }
  status: ThesisStatus
  date_of_creation: string
}

interface Supervisor {
  id: number
  name: string
  email: string
  department: string
  specialization: string
  availableSlots: number
  totalSlots: number
}

interface SupervisorBackend {
  id: number
  title: string
  first_name: string
  last_name: string
  email: string
  field_of_study: FieldOfStudy
  description: string
  free_spots: number
  total_spots: number
}

export type {
  NavigationItem,
  LoginFormData,
  JwtPayload,
  NewUser,
  FieldOfStudy,
  Supervisor,
  SupervisorBackend,
  ThesisStatus,
  ThesisDetails,
  ThesisBackend,
  UserRole,
}
export { LoginFormDataSchema, NewUserScheme, PasswordFormDataSchema }
