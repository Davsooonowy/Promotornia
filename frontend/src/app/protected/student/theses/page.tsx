"use client"
import ThesesList from "@/components/features/theses/ThesesList"

export default function ThesesListPage() {
  return (
    <ThesesList
      basePath="/protected/student/theses"
      supervisorsPath="/protected/student/supervisors"
      canEdit={false}
      canReserve={true}
    />
  )
}
