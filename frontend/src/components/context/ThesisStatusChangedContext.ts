import { createContext } from "react"

export type ThesisStatusChangedContextType = {
  thesisStatusChanged: boolean
  setThesisStatusChanged: (value: boolean) => void
}

export const ThesisStatusChangedContext = createContext<
  ThesisStatusChangedContextType | undefined
>(undefined)
