"use client"
import SupervisorsList from "@/components/features/supervisors/SupervisorsList"
import { UserRole } from "@/util/enums"

export default function SupervisorsListPage() {
  return (
    <SupervisorsList
      basePath="/protected/student/supervisors"
      canEdit={false}
      userRole={UserRole.student}
    />
  )
}
