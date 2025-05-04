"use client"
import SupervisorsList from "@/components/features/supervisors/SupervisorsList"

export default function SupervisorsListPage() {
  return (
    <SupervisorsList
      basePath="/protected/student/supervisors"
      canEdit={false}
    />
  )
}
