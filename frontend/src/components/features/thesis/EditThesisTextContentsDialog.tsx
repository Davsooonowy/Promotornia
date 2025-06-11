import { useState } from "react"
import { ThesisDetails } from "@/util/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Dispatch, SetStateAction } from "react"

type EditableField = "title" | "description" | "prerequisitesDescription"

export default function EditThesisTextContentDialog<
  T extends EditableField,
>(props: {
  thesis: ThesisDetails | null
  setThesis: Dispatch<SetStateAction<ThesisDetails | null>>
  field: T
  label: string // np. "Edytuj temat", "Edytuj opis"
  setHasUnsavedChanges: Dispatch<SetStateAction<boolean>>
}) {
  const [valueBeforeEdition, setValueBeforeEdition] = useState<
    ThesisDetails[T] | null
  >(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const value = props.thesis?.[props.field] ?? ""

  const handleCancel = () => {
    props.setThesis((prev) =>
      prev && valueBeforeEdition !== null
        ? { ...prev, [props.field]: valueBeforeEdition }
        : prev,
    )
    setDialogOpen(false)
  }

  const handleSave = () => {
    setDialogOpen(false)
    props.setHasUnsavedChanges(true)
  }

  return (
    <Dialog open={dialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => {
            setDialogOpen(true)
            setValueBeforeEdition(
              props.thesis ? props.thesis[props.field] : null,
            )
          }}
        >
          {props.label}
        </Button>
      </DialogTrigger>
      <DialogContent className="[&>button:last-child]:hidden">
        <DialogHeader>
          <DialogTitle>{props.label}</DialogTitle>
        </DialogHeader>
        <Textarea
          value={value}
          onChange={(e) => {
            const newValue = e.currentTarget.value
            props.setThesis((prev) =>
              prev ? { ...prev, [props.field]: newValue } : prev,
            )
          }}
        />
        <Button onClick={handleCancel}>Anuluj</Button>
        <Button onClick={handleSave}>Zapisz</Button>
      </DialogContent>
    </Dialog>
  )
}
