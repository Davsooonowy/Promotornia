import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import apiUrl from "@/util/apiUrl"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AssignStudentDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  onAssign: (studentId: number) => void
  thesisId: number
}

interface Student {
  id: number
  first_name: string
  last_name: string
  email: string
}

export default function AssignStudentDialog({
  open,
  setOpen,
  onAssign,
  thesisId,
}: AssignStudentDialogProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (open) {
      fetch(`${apiUrl}/students/available/?thesis_id=${thesisId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setStudents(data.students))
    }
  }, [open, thesisId])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Przypisz studenta do pracy</DialogTitle>
        <Select
          value={selectedId ? String(selectedId) : ""}
          onValueChange={(value) => setSelectedId(Number(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Wybierz studenta" />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.first_name} {s.last_name} ({s.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ul className="space-y-2">
          <li className="text-red-500">Niezapisane zmiany zostaną anulowane</li>
          <li>
            Nadal będzie można edytować zawartość pracy, dopóki nie dokonasz
            &quot;akceptacji&quot; studenta
          </li>
          <li>
            Ewentualna obecna rezerwacja studenta zostanie anulowana i
            przypisany zostanie nowy student
          </li>
          <li></li>
        </ul>
        <Button
          onClick={() => selectedId && onAssign(selectedId)}
          disabled={!selectedId}
        >
          Przypisz
        </Button>
      </DialogContent>
    </Dialog>
  )
}
