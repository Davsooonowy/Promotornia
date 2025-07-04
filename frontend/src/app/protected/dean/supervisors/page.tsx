"use client"
import SupervisorsList from "@/components/features/supervisors/SupervisorsList"
import { UserRole } from "@/util/enums"

export default function SupervisorsListPage() {
  return (
    <SupervisorsList
      basePath="/protected/dean/supervisors"
      canEdit={true}
      userRole={UserRole.dean}
    />
  )
}
