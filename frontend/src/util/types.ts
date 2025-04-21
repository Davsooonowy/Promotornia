interface NavigationItem {
  href: string
  text: string
}

interface LoginFormData {
  email: string
  password: string
}

interface JwtPayload {
  userId: number
  role: string
}

export type { NavigationItem, LoginFormData, JwtPayload }
