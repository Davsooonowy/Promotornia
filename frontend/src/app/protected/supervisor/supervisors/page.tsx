"use client"
import SupervisorsList from "@/components/features/supervisors/SupervisorsList"
import useDecodeToken from "@/hooks/useDecodeToken"

export default function SupervisorsListPage() {
  const { tokenPayload } = useDecodeToken()
  const currentUserId = tokenPayload?.userId

  return (
    <SupervisorsList
      basePath="/protected/supervisor/supervisors"
      canEdit={true}
      currentUserId={currentUserId}
    />
  )
}
