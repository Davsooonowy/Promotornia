import { z } from "zod"
interface NavigationItem {
  href: string
  text: string
}

// interface LoginFormData {
//   email: string
//   password: string
// }

const LoginFormDataSchema = z.object({
  email: z.string().email({ message: "Niepoprawny email" }),
  password: z.string().min(4, { message: "Hasło za krótkie" }),
})

type LoginFormData = z.infer<typeof LoginFormDataSchema>

interface JwtPayload {
  userId: number
  role: string
}

export type { NavigationItem, LoginFormData, JwtPayload }
export { LoginFormDataSchema }
