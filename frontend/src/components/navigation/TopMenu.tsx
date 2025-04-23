import NavigationItem from "@/types/NavigationItem"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "../ui/navigation-menu"
import Link from "next/link"
import { CiUser } from "react-icons/ci"

function TopMenu(props: { navItems: NavigationItem[]; userRoleHref: string }) {
  return (
    <div className="flex min-h-8 w-full justify-between">
      <div className="flex px-12">
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
      </div>
      <Link href={`/protected/${props.userRoleHref}/profile`}>
        <CiUser size={72} className="mr-5 cursor-pointer" />
      </Link>
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
  return (
    <TopMenu
      navItems={[
        {
          href: "/protected/supervisor/theses/own/1",
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
