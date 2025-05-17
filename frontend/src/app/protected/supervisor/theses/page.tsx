"use client"
import ThesesList from "@/components/features/theses/ThesesList"
import useDecodeToken from "@/hooks/useDecodeToken"

export default function ThesesListPage() {
  const { tokenPayload } = useDecodeToken()
  const currentUserId = tokenPayload?.user_id

  return (
    <ThesesList
      basePath="/protected/supervisor/theses"
      supervisorsPath="/protected/supervisor/supervisors"
      canEdit={true}
      currentUserId={currentUserId}
    />
  )
}
