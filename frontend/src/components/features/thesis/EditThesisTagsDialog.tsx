import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tag, ThesisDetails } from "@/util/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dispatch, SetStateAction } from "react"
import { Input } from "@/components/ui/input"
import { useMutation, UseMutationResult } from "@tanstack/react-query"
import apiUrl from "@/util/apiUrl"
import { toast } from "sonner"

export default function EditThesisTagsDialog(props: {
  thesis: ThesisDetails | null
  setThesis: Dispatch<SetStateAction<ThesisDetails | null>>
  allTags: Tag[] | null
  allTagsFetch: UseMutationResult<Tag[], Error, void, unknown>
}) {
  const [valueBeforeEdition, setValueBeforeEdition] = useState<Tag[] | null>(
    null,
  )
  const [dialogOpen, setDialogOpen] = useState(false)

  const [newTagName, setNewTagName] = useState("")

  const newTagMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token")
      const response = await fetch(`${apiUrl}/supervisor/tags/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTagName,
        }),
      })
      if (!response.ok) {
        throw new Error("Nie udało się dodać tagu.")
      }
    },
    onError: (e) => {
      toast.error(e.message)
    },
    onSuccess: () => {
      setNewTagName("")
      props.allTagsFetch.mutate()
      toast.success("Dodano tag")
    },
  })

  const handleCancel = () => {
    props.setThesis((prev) =>
      prev && valueBeforeEdition !== null
        ? { ...prev, tags: valueBeforeEdition }
        : prev,
    )
    setDialogOpen(false)
  }

  const handleSave = () => {
    setDialogOpen(false)
  }

  const toggleTag = (tagId: number, tagName: string) => {
    const isTagSelected = props.thesis?.tags.find((tag) => tag.id === tagId)
    if (isTagSelected) {
      props.setThesis((curThesis) =>
        curThesis
          ? {
              ...curThesis,
              tags: curThesis.tags.filter((tag) => tag.id !== tagId),
            }
          : curThesis,
      )
    } else {
      props.setThesis((curThesis) =>
        curThesis
          ? {
              ...curThesis,
              tags: [...curThesis.tags, { id: tagId, name: tagName }],
            }
          : curThesis,
      )
    }
  }

  return (
    <Dialog open={dialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => {
            setDialogOpen(true)
            setValueBeforeEdition(props.thesis ? props.thesis.tags : null)
          }}
        >
          Edytuj tagi
        </Button>
      </DialogTrigger>
      <DialogContent className="[&>button:last-child]:hidden">
        <DialogHeader>
          <DialogTitle>Edytuj tagi</DialogTitle>
        </DialogHeader>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Tagi
              {props.thesis && props.thesis.tags.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {props.thesis.tags.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[300px] w-80 overflow-auto">
            {props.allTags?.length && props.allTags.length > 0 ? (
              props.allTags?.map((tag) => {
                return (
                  <DropdownMenuItem
                    key={tag.id}
                    onClick={(e) => {
                      e.preventDefault()
                      toggleTag(tag.id, tag.name)
                    }}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      checked={
                        props.thesis
                          ? props.thesis.tags
                              .map((tag) => tag.id)
                              .includes(tag.id)
                          : false
                      }
                      id={`tag-${tag.id}`}
                    />
                    <Label
                      htmlFor={`tag-${tag.id}`}
                      className="flex-grow cursor-pointer"
                    >
                      {tag.name}
                    </Label>
                  </DropdownMenuItem>
                )
              })
            ) : (
              <Label>Brak tagów</Label>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex">
          <Input
            value={newTagName}
            onInput={(e) => setNewTagName(e.currentTarget.value)}
            onChange={(e) => setNewTagName(e.currentTarget.value)}
          />
          <Button onClick={() => newTagMutation.mutate()}>Dodaj tag</Button>
        </div>
        <Label className="text-red-500">
          Uwaga! Przed dodaniem nowego tagu proszę się upewnić, że potrzebny tag
          jeszcze nie istnieje!
        </Label>
        <Button onClick={handleCancel}>Anuluj</Button>
        <Button onClick={handleSave}>Zapisz</Button>
      </DialogContent>
    </Dialog>
  )
}
