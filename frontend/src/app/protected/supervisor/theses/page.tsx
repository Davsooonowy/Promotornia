"use client"
import ThesesList from "@/components/features/theses/ThesesList"
import { UserRole } from "@/util/enums"

export default function ThesesListPage() {
  return (
    <ThesesList
      basePath="/protected/supervisor/theses"
      userRole={UserRole.supervisor}
    />
  )
}
