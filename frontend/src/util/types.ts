import { z } from "zod"
interface NavigationItem {
  href: string
  text: string
}

const LoginFormDataSchema = z.object({
  email: z.string().email({ message: "Niepoprawny email" }),
  password: z.string().min(4, { message: "Hasło za krótkie" }),
})

type LoginFormData = z.infer<typeof LoginFormDataSchema>

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
}
export { LoginFormDataSchema, NewUserScheme }
