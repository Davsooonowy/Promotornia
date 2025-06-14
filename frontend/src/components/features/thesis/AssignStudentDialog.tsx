import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import apiUrl from "@/util/apiUrl"

export default function AssignStudentDialog({ open, setOpen, onAssign }) {
  const [students, setStudents] = useState([])
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (open) {
      fetch(`${apiUrl}/students/available/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setStudents(data.students))
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Przypisz studenta do pracy</DialogTitle>
        <select
          className="input w-full"
          value={selectedId ?? ""}
          onChange={(e) => setSelectedId(Number(e.target.value))}
        >
          <option value="">Wybierz studenta</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.first_name} {s.last_name} ({s.email})
            </option>
          ))}
        </select>
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