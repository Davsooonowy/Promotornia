import { NavigationItem } from "@/util/types"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "../ui/navigation-menu"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useDecodeToken from "@/hooks/useDecodeToken"

function TopMenu(props: { navItems: NavigationItem[]; userRoleHref: string }) {
  const router = useRouter()
  const [logout, setLogout] = useState(false)

  useEffect(() => {
    if (logout) {
      localStorage.removeItem("token")
      router.push("/")
    }
  }, [logout, router])

  return (
    <div className="flex min-h-8 w-full justify-between px-10">
      <NavigationMenu>
        <NavigationMenuList>
          {props.navItems.map((navItem) => (
            <NavigationMenuItem key={navItem.href}>
              <NavigationMenuLink asChild>
                <Link href={navItem.href}>{navItem.text}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center space-x-4">
        <Button
          variant="default"
          className="cursor-pointer"
          onClick={() => setLogout(true)}
        >
          Wyloguj
        </Button>
        <Link href={`/protected/${props.userRoleHref}/profile`}>
          <Button variant="secondary" className="cursor-pointer">
            Profil
          </Button>
        </Link>
      </div>
    </div>
  )
}

function StudentTopMenu() {
  return (
    <TopMenu
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
    />
  )
}

function SupervisorTopMenu() {
  const { tokenPayload } = useDecodeToken()

  if (!tokenPayload) {
    return null
  }

  return (
    <TopMenu
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
          href: "/protected/supervisor/supervisors",
          text: "Lista promotorów",
        },
        {
          href: "/protected/supervisor/theses/1",
          text: "Dodaj nowy temat",
        },
      ]}
      userRoleHref="supervisor"
    />
  )
}

function DeanTopMenu() {
  return (
    <TopMenu
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
    />
  )
}

export { StudentTopMenu, SupervisorTopMenu, DeanTopMenu }
