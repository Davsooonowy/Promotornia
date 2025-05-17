import { UseMutationResult } from "@tanstack/react-query"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { ThesisDetails, ThesisStatus } from "@/util/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog"
import { Dispatch, SetStateAction } from "react"

export default function EditThesisStatusDialog(props: {
  thesis: ThesisDetails | null
  setThesis: Dispatch<SetStateAction<ThesisDetails | null>>
  changeThesisStatusMutation: UseMutationResult<
    ThesisStatus,
    Error,
    ThesisStatus
  >
  newStatus: ThesisStatus | "Hide or publish"
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  let title
  if (props.newStatus === "Hide or publish") {
    title =
      props.thesis?.status !== "Ukryty" ? "Ukryj pracę" : "Opublikuj pracę"
  } else if (props.newStatus === "Student zaakceptowany") {
    title = "Zaakceptuj studenta"
  }

  return (
    <Dialog open={dialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="cursor-pointer"
          onClick={() => setDialogOpen(true)}
        >
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="[&>button:last-child]:hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Label>
          Czy jesteś pewien? Ta akcja będzie miała następujące konsekwencje:
        </Label>
        {props.newStatus === "Hide or publish" &&
          (props.thesis?.status !== "Ukryty" ? (
            <ul>
              <li>Praca nie będzie już widoczna przez innych</li>
              {props.thesis?.reservedBy && (
                <li className="text-red-500">
                  Obecna rezerwacja tematu przez studenta zostanie anulowana
                </li>
              )}
            </ul>
          ) : (
            <ul>
              <li>Od teraz praca będzie widoczna przez innych</li>
              <li>
                Nie będzie można zmienić kierunku studiów, którego dotyczy praca
              </li>
            </ul>
          ))}
        {props.newStatus === "Student zaakceptowany" && (
          <ul>
            <li>Student otrzyma prośbę o zatwierdzenie realizacji tematu</li>
            {props.thesis?.reservedBy && (
              <li className="text-red-500">
                Nie będzie można już edytować zawartości pracy
              </li>
            )}
          </ul>
        )}
        <Button onClick={() => setDialogOpen(false)}>Anuluj</Button>
        <Button
          onClick={() => {
            setDialogOpen(false)
            if (props.newStatus === "Hide or publish") {
              props.changeThesisStatusMutation.mutate(
                props.thesis?.status !== "Ukryty" ? "Ukryty" : "Dostępny",
              )
            } else {
              props.changeThesisStatusMutation.mutate(props.newStatus)
            }
          }}
        >
          Potwierdź
        </Button>
      </DialogContent>
    </Dialog>
  )
}
