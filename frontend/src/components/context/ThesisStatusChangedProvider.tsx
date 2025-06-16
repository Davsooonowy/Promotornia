import { useContext, useState } from "react"
import { ThesisStatusChangedContext } from "./ThesisStatusChangedContext"

export function useThesisStatusChanged() {
  const context = useContext(ThesisStatusChangedContext)
  if (!context) {
    throw new Error(
      "useThesisStatusChanged must be used within a ThesisStatusChangedProvider",
    )
  }
  return context
}

export function ThesisStatusChangedProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [thesisStatusChanged, setThesisStatusChanged] = useState(false)

  return (
    <ThesisStatusChangedContext.Provider
      value={{ thesisStatusChanged, setThesisStatusChanged }}
    >
      {children}
    </ThesisStatusChangedContext.Provider>
  )
}
