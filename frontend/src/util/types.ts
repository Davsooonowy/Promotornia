import { z } from "zod"
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

type PasswordFormData = z.infer<typeof PasswordFormDataSchema>

interface JwtPayload {
  user_id: number
  role: string
}

const NewUserScheme = z.object({
  key: z.number(),
  email: z.string().email({ message: "Niepoprawny email" }),
})

type NewUser = z.infer<typeof NewUserScheme> & {
  emailError: string | null
}

// interface NewUser {
//   key: number
//   email: string
// }

interface FieldOfStudy {
  id: number
  field: string
}

interface ServerMessageResponse {
  message: string
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
}

interface Supervisor {
  id: number
  name: string
  email: string
  department: string
  specialization: string
  availableSlots: number
  totalSlots: number
  tags: string[]
}

export type {
  NavigationItem,
  LoginFormData,
  JwtPayload,
  NewUser,
  FieldOfStudy,
  ServerMessageResponse,
  PasswordFormData,
  Supervisor,
  ThesisStatus,
  ThesisDetails,
}
export { LoginFormDataSchema, NewUserScheme, PasswordFormDataSchema }
