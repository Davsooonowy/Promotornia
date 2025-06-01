"use client"
import ThesesList from "@/components/features/theses/ThesesList"
import { UserRole } from "@/util/enums"

export default function ThesesListPage() {
  return (
    <ThesesList
      basePath="/protected/student/theses"
      userRole={UserRole.student}
    />
  )
}
