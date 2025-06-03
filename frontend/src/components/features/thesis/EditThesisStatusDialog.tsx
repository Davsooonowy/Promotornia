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
    void,
    Error,
    ThesisStatus,
    unknown
  >
  newStatus: ThesisStatus | "Hide or publish"
  oldStatus?: ThesisStatus
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  let title
  if (props.newStatus === "Hide or publish") {
    title =
      props.thesis?.status !== "Ukryty" ? "Ukryj pracę" : "Opublikuj pracę"
  } else if (props.newStatus === "Dostępny") {
    title = "Usuń rezerwację studenta"
  } else if (props.newStatus === "Student zaakceptowany") {
    title = "Zaakceptuj studenta"
  } else if (props.newStatus === "Zarezerwowany") {
    title = "Zarezerwuj temat"
  } else if (props.newStatus === "Zatwierdzony") {
    title = "Zatwierdź ostatecznie"
  }

  return (
    <Dialog open={dialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant={
            props.newStatus === "Zarezerwowany" ||
            props.newStatus === "Student zaakceptowany"
              ? "default"
              : "ghost"
          }
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
        {props.newStatus === "Zarezerwowany" && (
          <ul>
            <li>
              Promotor nadal będzie mógł zmieniać zawartość pracy aż status
              zostanie ustawiony na &quot;Student zaakceptowany&quot;, ale
              będziesz mógł jeszcze cofnąć rezerwację. Promotor zostanie
              poproszony o zaaceptowanie Twojej rezerwacji, co ty jeszcze
              będziesz musiał zatwierdzić (wtedy już ostatecznie) lub
              zrezygnować.
            </li>
          </ul>
        )}
        {props.newStatus === "Zatwierdzony" && (
          <ul>
            <li className="text-red-500">
              Nie będzie można już cofnąć rezerwacji, zostaniesz ostatecznie
              przypisany do tematu
            </li>
            <li>
              Promotor nie będzie już mógł modyfikować zawartości pracy (już
              teraz nie może, bo status to &quot;Student zaakceptowany&quot;)
            </li>
          </ul>
        )}
        {props.newStatus === "Dostępny" && (
          <ul>
            <li className="text-red-500">
              Obecna rezerwacja studenta zostanie anulowana
            </li>
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
