"use client"
import ThesesList from "@/components/features/theses/ThesesList"

export default function ThesesListPage() {
  return (
    <ThesesList
      basePath="/protected/dean/theses"
      supervisorsPath="/protected/dean/supervisors"
      canEdit={true}
    />
  )
}
