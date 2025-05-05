"use client"
import ChangePersonalData from "@/components/features/profile/ChangePersonalData"
import ChangePassword from "@/components/features/profile/ChangePassword"
import LabelWithEmail from "@/components/features/profile/LabelWithEmail"

export default function Profile() {
  return (
    <div className="w-1/3 space-y-3">
      <LabelWithEmail />
      <ChangePersonalData />
      <ChangePassword />
    </div>
  )
}
