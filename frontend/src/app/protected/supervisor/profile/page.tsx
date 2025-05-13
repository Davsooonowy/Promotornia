"use client"
import ChangePersonalData from "@/components/features/profile/ChangePersonalData"
import ChangePassword from "@/components/features/profile/ChangePassword"
import ChangeSupervisorTags from "@/components/features/profile/ChangeSupervisorTags"
import { Label } from "@/components/ui/label"
import LabelWithEmail from "@/components/features/profile/LabelWithEmail"

export default function Profile() {
  return (
    <div className="flex w-full justify-between">
      <div className="w-1/3 space-y-3">
        <LabelWithEmail />
        <ChangePersonalData />
        <ChangePassword />
      </div>
      {/* <div className="ml-3 w-2/3 space-y-3">
        <Label className="ml-3 text-3xl">Tagi zainteresowań:</Label>
        <ChangeSupervisorTags />
      </div> */}
    </div>
  )
}
