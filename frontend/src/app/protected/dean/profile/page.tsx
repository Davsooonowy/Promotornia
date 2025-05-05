"use client"
import ChangePassword from "@/components/features/profile/ChangePassword"
import LabelWithEmail from "@/components/features/profile/LabelWithEmail"

export default function Profile() {
  return (
    <div className="w-1/3 space-y-3">
      <LabelWithEmail />
      <ChangePassword />
    </div>
  )
}
