import { useState } from "react"
import { Label } from "@/components/ui/label"
import { FieldOfStudy, ThesisDetails } from "@/util/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dispatch, SetStateAction } from "react"

export default function EditFieldOfStudyDialog(props: {
  thesis: ThesisDetails | null
  setThesis: Dispatch<SetStateAction<ThesisDetails | null>>
  fieldsOfStudy: FieldOfStudy[] | null
}) {
  const [valueBeforeEdition, setValueBeforeEdition] =
    useState<FieldOfStudy | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const setFieldOfStudy = (fieldOfStudyId: number) => {
    props.setThesis((theThesis) => {
      const fieldOfStudy = props.fieldsOfStudy?.find(
        (fieldOfStudy) => fieldOfStudy.id === fieldOfStudyId,
      )
      if (!fieldOfStudy || !theThesis) return theThesis
      return { ...theThesis, fieldOfStudy }
    })
  }

  const handleCancel = () => {
    props.setThesis((prev) =>
      prev && valueBeforeEdition !== null
        ? { ...prev, fieldOfStudy: valueBeforeEdition }
        : prev,
    )
    setDialogOpen(false)
  }

  const handleSave = () => {
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => {
            setValueBeforeEdition(
              props.thesis ? props.thesis.fieldOfStudy : null,
            )
            setDialogOpen(true)
          }}
        >
          Edytuj kierunek
        </Button>
      </DialogTrigger>
      <DialogContent className="[&>button:last-child]:hidden">
        <DialogHeader>
          <DialogTitle>Edytuj kierunek</DialogTitle>
        </DialogHeader>
        <Label>Kierunek studiów:</Label>
        <Select onValueChange={(value) => setFieldOfStudy(Number(value))}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Wybierz kierunek" />
          </SelectTrigger>
          <SelectContent>
            {props.fieldsOfStudy?.map((fieldOfStudy) => (
              <SelectItem value={String(fieldOfStudy.id)} key={fieldOfStudy.id}>
                {fieldOfStudy.field}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleCancel}>Anuluj</Button>
        <Button onClick={handleSave}>Zapisz</Button>
      </DialogContent>
    </Dialog>
  )
}
