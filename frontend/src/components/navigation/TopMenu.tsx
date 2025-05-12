"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { Menu, ChevronDown, LogOut, User, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import useDecodeToken from "@/hooks/useDecodeToken"
import type { NavigationItem } from "@/util/types"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

interface NavbarProps {
  navItems: NavigationItem[]
  userRoleHref: string
  roleName: string
}

export function Navbar({ navItems, userRoleHref, roleName }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const { theme, setTheme } = useTheme()

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled
          ? "bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur"
          : "bg-background",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-primary h-8 w-8" />
          <span className="hidden text-xl font-bold md:inline-block">
            Promotornia
          </span>
        </div>

        <nav className="hidden md:flex md:items-center md:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "hover:text-primary text-sm font-medium transition-colors",
                pathname === item.href
                  ? "text-primary font-semibold"
                  : "text-muted-foreground",
              )}
            >
              {item.text}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="mr-2"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline-block">{roleName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/protected/${userRoleHref}/profile`}>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                Wyloguj
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Otwórz menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="mb-4">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "hover:text-primary flex items-center py-2 text-base font-medium transition-colors",
                        pathname === item.href
                          ? "text-primary font-semibold"
                          : "text-muted-foreground",
                      )}
                    >
                      {item.text}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link
                    href={`/protected/${userRoleHref}/profile`}
                    className="hover:text-primary flex items-center py-2 text-base font-medium transition-colors"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="mt-2 w-full justify-start"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  >
                    {theme === "dark" ? (
                      <Sun className="mr-2 h-4 w-4" />
                    ) : (
                      <Moon className="mr-2 h-4 w-4" />
                    )}
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                  </Button>
                </SheetClose>
                <Button
                  variant="destructive"
                  className="mt-2 w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Wyloguj
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export function StudentTopMenu() {
  const { tokenPayload } = useDecodeToken()

  if (!tokenPayload) return null

  return (
    <Navbar
      navItems={[
        {
          href: "/protected/student/theses/1",
          text: "Mój Temat",
        },
        {
          href: "/protected/student/theses",
          text: "Lista tematów",
        },
        {
          href: "/protected/student/supervisors",
          text: "Lista promotorów",
        },
      ]}
      userRoleHref="student"
      roleName="Student"
    />
  )
}

export function SupervisorTopMenu() {
  const { tokenPayload } = useDecodeToken()

  if (!tokenPayload) return null

  return (
    <Navbar
      navItems={[
        {
          href: `/protected/supervisor/theses/own/${tokenPayload.userId}`,
          text: "Moje tematy",
        },
        {
          href: "/protected/supervisor/theses",
          text: "Lista tematów",
        },
        {
          href: "/protected/supervisor/theses/1",
          text: "Dodaj nowy temat",
        },
      ]}
      userRoleHref="supervisor"
      roleName="Promotor"
    />
  )
}

export function DeanTopMenu() {
  return (
    <Navbar
      navItems={[
        {
          href: "/protected/dean/theses",
          text: "Lista tematów",
        },
        {
          href: "/protected/dean/supervisors",
          text: "Lista promotorów",
        },
        {
          href: "/protected/dean/manage_users?user_type=student",
          text: "Zarządzaj studentami",
        },
        {
          href: "/protected/dean/manage_users?user_type=supervisor",
          text: "Zarządzaj promotorami",
        },
      ]}
      userRoleHref="dean"
      roleName="Dziekanat"
    />
  )
}
