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
  userId: number
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

export type {
  NavigationItem,
  LoginFormData,
  JwtPayload,
  NewUser,
  FieldOfStudy,
  ServerMessageResponse,
  PasswordFormData,
}
export { LoginFormDataSchema, NewUserScheme, PasswordFormDataSchema }
