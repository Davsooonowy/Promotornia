"use client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useSearchParams } from "next/navigation"
import { useState, useMemo, useRef } from "react"
import { FaPlus } from "react-icons/fa"
import { useMutation } from "@tanstack/react-query"
import { NewUser, FieldOfStudy, NewUserScheme } from "@/util/types"
import NewUserCard from "@/components/features/manage_users/NewUserCard"
import ActionDialog from "@/components/features/manage_users/ActionDialog"
import apiUrl from "@/util/apiUrl"
import { toast } from "sonner"
import Papa from "papaparse"
import { Input } from "@/components/ui/input"
import { mergeUniqueUsers } from "@/util/mergeUniqueUsers"
import { ArrowDownToLine, ArrowUpToLine, Ban, FileDown } from "lucide-react"

const actionToLabel = new Map([
  ["addUsers", "Dodaj użytkowników"],
  ["deleteUsers", "Usuń użytkowników"],
])

export default function ManageUsers() {
  const searchParams = useSearchParams()
  const userType = useMemo(() => searchParams.get("user_type"), [searchParams])

  // new user list
  const [newUsers, setNewUsers] = useState<NewUser[]>([])
  const [nextUserKey, setNextUserKey] = useState<number>(1) // used when adding a new user to "newUsers" state variable

  // action dialog triggered when "Przejdź dalej" button clicked
  const [action, setAction] = useState<string | null>(null) // possible values: addUsers, deleteUsers, sendEmail
  const [expirationDate, setExpirationDate] = useState<Date>(new Date())

  const [chosenFieldsOfStudyCount, setChosenFieldsOfStudyCount] = useState(0)
  const [chosenFieldsOfStudy, setChosenFieldsOfStudy] = useState<
    FieldOfStudy[]
  >([])

  const fileInput = useRef<HTMLInputElement | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const actionMutation = useMutation({
    mutationFn: async () => {
      let validation_ok = true
      for (const newUser of newUsers) {
        const result = NewUserScheme.safeParse(newUser)

        if (!result.success) {
          validation_ok = false
          const fieldErrors = result.error.flatten().fieldErrors
          setNewUsers((curNewUsers) =>
            curNewUsers.map((curNewUser) => {
              if (curNewUser.key === newUser.key) {
                return {
                  ...curNewUser,
                  emailError: fieldErrors.email?.[0] ?? null,
                }
              } else {
                return { ...curNewUser }
              }
            }),
          )
        }
      }
      if (!validation_ok) {
        toast.error("Wystąpiły błędy. Nie wykonano akcji.")
        return
      }

      try {
        const token = localStorage.getItem("token")
        let body
        let method
        if (action === "addUsers") {
          if (chosenFieldsOfStudy.length === 0) {
            toast.error("Akcja nie powiodła się.", {
              description: "Podaj kierunki studiów",
            })
            return
          }
          const uniqueIds = new Set(chosenFieldsOfStudy.map((f) => f.id))
          if (uniqueIds.size !== chosenFieldsOfStudy.length) {
            toast.error("Akcja nie powiodła się.", {
              description:
                "Ten sam kierunek studiów został wybrany więcej niż raz.",
            })
            return
          }
          if (!expirationDate) {
            toast.error("Akcja nie powiodła się.", {
              description: "Podaj datę wygaśnięcia kont",
            })
            return
          }
          body = {
            userType,
            newUsers: newUsers.map((newUser) => ({
              email: newUser.email,
            })),
            expirationDate: expirationDate.toISOString().split("T")[0],
            chosenFieldsOfStudy: chosenFieldsOfStudy.map((field) => ({
              id: field.id,
            })),
          }
          method = "POST"
        } else if (action === "deleteUsers") {
          body = {
            usersToDelete: newUsers.map((newUser) => ({
              email: newUser.email,
            })),
          }
          method = "DELETE"
        }
        const response = await fetch(`${apiUrl}/dean/users/`, {
          method: method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        })

        if (response.ok) {
          let desc
          if (action === "addUsers") {
            desc = `Stworzono konto dla ${newUsers.length} użytkowników i wysłano im e-maile.`
          } else {
            desc = `Usunięto ${newUsers.length} użytkowników.`
          }
          toast.success("Akcja zakończona sukcesem", {
            description: desc,
          })
          setNewUsers([])
        } else {
          const errorData = await response.json()
          toast.error("Akcja nie powiodła się", {
            description: errorData.detail || "Wystąpił nieznany błąd.",
          })
        }
      } catch {
        toast.error("Wystąił nieznany błąd.")
      }
    },
  })

  const handleUpdateEmail = (key: number, newEmail: string) => {
    setNewUsers((state) =>
      state.map((user) => {
        if (user.key === key) {
          return {
            key: key,
            email: newEmail,
            emailError: null,
          }
        } else return user
      }),
    )
  }

  const handleAddNewUser = () => {
    setNewUsers((curNewUsers) => [
      ...curNewUsers,
      {
        key: nextUserKey,
        email: "",
        emailError: null,
      },
    ])
    setNextUserKey((curKey) => curKey + 1)
  }

  const handleRemoveUser = (key: number) => {
    setNewUsers((state) => state.filter((user) => user.key !== key))
  }

  const handleFileImport = () => {
    if (!fileInput.current) return
    const file = fileInput.current.files?.[0]

    if (file) {
      Papa.parse<{ email: string }>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const importedUsers = results.data.map((row, index) => ({
            email: row.email.trim(),
            emailError: null,
            key: nextUserKey + index,
          }))

          const { users, duplicates } = mergeUniqueUsers(
            newUsers,
            importedUsers,
          )

          setNewUsers(users)
          setNextUserKey(nextUserKey + importedUsers.length)

          if (duplicates > 0) {
            toast.warning(`Pominięto ${duplicates} duplikatów adresów email.`)
          }
        },
      })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
  }

  const scrollToNextError = () => {
    const index = newUsers.findIndex((user) => user.emailError)
    if (index !== -1 && cardRefs.current[index]) {
      cardRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    } else {
      toast.info("Brak kolejnych błędów do pokazania.")
    }
  }

  return (
    <>
      <div className="w-full space-y-4">
        <Label className="items-start text-4xl">
          Zarządzanie {userType === "supervisor" ? "promotorami" : "studentami"}
        </Label>
        <div className="mt-4 flex flex-col space-y-4">
          <Label>
            <FileDown />
            Zaimportuj {userType === "supervisor"
              ? "promotorów"
              : "studentów"}{" "}
            z pliku CSV. Wymagania: kolumna &apos;email&apos; musi być zawarta w
            pliku
          </Label>
          <div className="flex">
            <Input type="file" accept=".csv" className="w-96" ref={fileInput} />
            <Button onClick={handleFileImport}>Zaimportuj</Button>
          </div>
          <ActionDialog
            actionToLabel={actionToLabel}
            userType={userType}
            setAction={setAction}
            action={action}
            expirationDate={expirationDate}
            setExpirationDate={setExpirationDate}
            setChosenFieldsOfStudy={setChosenFieldsOfStudy}
            chosenFieldsOfStudy={chosenFieldsOfStudy}
            setChosenFieldsOfStudyCount={setChosenFieldsOfStudyCount}
            chosenFieldsOfStudyCount={chosenFieldsOfStudyCount}
            actionMutation={actionMutation}
            mergeUniqueUsers={mergeUniqueUsers}
            newUsers={newUsers}
            setNewUsers={setNewUsers}
            nextUserKey={nextUserKey}
            setNextUserKey={setNextUserKey}
          />
        </div>
        <div className="mx-auto max-w-3xl space-y-4">
          {newUsers.map((newUser, index) => (
            <div
              ref={(el) => {
                cardRefs.current[index] = el
              }}
              key={newUser.key}
            >
              <NewUserCard
                newUser={newUser}
                handleRemoveUser={handleRemoveUser}
                handleUpdateEmail={handleUpdateEmail}
                error={newUser.emailError}
              />
            </div>
          ))}
        </div>
        <div className="flex w-full justify-center">
          <Button onClick={handleAddNewUser} className="mb-4 cursor-pointer">
            <FaPlus />
            <p>Więcej użytkowników</p>
          </Button>
        </div>
      </div>
      <div className="fixed right-12 bottom-24 flex gap-4">
        <Button variant="default" onClick={scrollToTop}>
          <ArrowUpToLine />
          Skocz na górę
        </Button>
        <Button variant="default" onClick={scrollToBottom}>
          <ArrowDownToLine />
          Skocz na dół
        </Button>
        <Button variant="destructive" onClick={scrollToNextError}>
          <Ban />
          Skocz do błędu
        </Button>
      </div>
    </>
  )
}
