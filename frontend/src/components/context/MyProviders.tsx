"use client"
import React from "react"
import { ThesisStatusChangedProvider } from "./ThesisStatusChangedProvider"

export function MyProviders({ children }: { children: React.ReactNode }) {
  return <ThesisStatusChangedProvider>{children}</ThesisStatusChangedProvider>
}
