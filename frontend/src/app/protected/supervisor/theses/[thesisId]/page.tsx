"use client"
import { useParams } from "next/navigation"

export default function Thesis() {
  const { thesisId } = useParams()
  return <h1>Temat nr {thesisId}</h1>
}
