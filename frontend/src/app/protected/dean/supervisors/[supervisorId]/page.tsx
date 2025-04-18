"use client"
import { useParams } from "next/navigation"

export default function Supervisor() {
  const { supervisorId } = useParams()
  return <h1>Promotor nr {supervisorId}</h1>
}
