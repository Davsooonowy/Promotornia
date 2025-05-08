"use client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useSearchParams } from "next/navigation"
import { useState, useMemo } from "react"
import { FaPlus } from "react-icons/fa"
import { useMutation } from "@tanstack/react-query"
import { NewUser, FieldOfStudy, NewUserScheme } from "@/util/types"
import NewUserCard from "@/components/features/manage_users/NewUserCard"
import ActionDialog from "@/components/features/manage_users/ActionDialog"
import apiUrl from "@/util/apiUrl"
import { toast } from "sonner"

const actionToLabel = new Map([
  ["addUsers", "Dodaj użytkowników"],
  ["deleteUsers", "Usuń użytkowników"],
  ["sendEmail", "Wyślij e-mail do użytkowników"],
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
  const [fieldOfStudy, setFieldOfStudy] = useState<FieldOfStudy | null>(null)

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
        const response = await fetch(`${apiUrl}/dean/users/`, {
          method: action === "addUsers" ? "POST" : "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            action === "addUsers"
              ? {
                  userType,
                  newUsers: newUsers.map((newUser) => ({
                    email: newUser.email,
                  })),
                  expirationDate: expirationDate.toISOString().split("T")[0],
                  fieldOfStudy,
                }
              : {
                  usersToDelete: newUsers.map((newUser) => ({
                    email: newUser.email,
                  })),
                },
          ),
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

  return (
    <div className="w-full space-y-4">
      <Label className="items-start text-4xl">
        Zarządzanie {userType === "supervisor" ? "promotorami" : "studentami"}
      </Label>
      <div className="mt-4 flex flex-col space-y-4">
        <Button className="cursor-pointer self-start">
          Zaimportuj {userType === "supervisor" ? "promotorów" : "studentów"} z
          pliku
        </Button>
        <ActionDialog
          actionToLabel={actionToLabel}
          userType={userType}
          setAction={setAction}
          action={action}
          expirationDate={expirationDate}
          setExpirationDate={setExpirationDate}
          setFieldOfStudy={setFieldOfStudy}
          fieldOfStudy={fieldOfStudy}
          actionMutation={actionMutation}
        />
      </div>
      <div className="mx-auto max-w-3xl space-y-4">
        {newUsers.map((newUser) => (
          <NewUserCard
            key={newUser.key}
            newUser={newUser}
            handleRemoveUser={handleRemoveUser}
            handleUpdateEmail={handleUpdateEmail}
            error={newUser.emailError}
          />
        ))}
      </div>
      <div className="flex w-full justify-center">
        <Button onClick={handleAddNewUser} className="mb-4 cursor-pointer">
          <FaPlus />
          <p>Więcej użytkowników</p>
        </Button>
      </div>
    </div>
  )
}
