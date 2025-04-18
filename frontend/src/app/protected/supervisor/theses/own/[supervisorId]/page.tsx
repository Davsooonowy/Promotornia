"use client"
import { useParams } from "next/navigation"

export default function OwnTheses() {
  const { supervisorId } = useParams()
  return <h1>Tematy promotora nr {supervisorId}</h1>
}
