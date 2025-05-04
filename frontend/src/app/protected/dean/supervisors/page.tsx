"use client"
import SupervisorsList from "@/components/features/supervisors/SupervisorsList"

export default function SupervisorsListPage() {
  return (
    <SupervisorsList basePath="/protected/dean/supervisors" canEdit={true} />
  )
}
