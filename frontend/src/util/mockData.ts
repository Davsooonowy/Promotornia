export interface Supervisor {
  id: number
  name: string
  email: string
  department: string
  specialization: string
  availableSlots: number
  totalSlots: number
  tags: string[]
}

export const mockSupervisors: Supervisor[] = [
  {
    id: 1,
    name: "dr inż. Katarzyna Kowalska",
    email: "k.kowalska@example.com",
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    specialization: "Sztuczna inteligencja",
    availableSlots: 5,
    totalSlots: 10,
    tags: ["AI", "Machine Learning", "Data Science"],
  },
  {
    id: 2,
    name: "prof. dr hab. Jan Nowak",
    email: "j.nowak@example.com",
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    specialization: "Analiza danych",
    availableSlots: 2,
    totalSlots: 8,
    tags: ["Data Analysis", "Big Data", "Statistics"],
  },
  {
    id: 3,
    name: "dr Tomasz Wiśniewski",
    email: "t.wisniewski@example.com",
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    specialization: "Bezpieczeństwo sieci",
    availableSlots: 0,
    totalSlots: 6,
    tags: ["Network Security", "Cybersecurity", "Cryptography"],
  },
  {
    id: 4,
    name: "dr hab. Anna Malinowska",
    email: "a.malinowska@example.com",
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    specialization: "Inżynieria oprogramowania",
    availableSlots: 3,
    totalSlots: 7,
    tags: ["Software Engineering", "Agile", "DevOps"],
  },
  {
    id: 5,
    name: "prof. dr hab. Piotr Kowalczyk",
    email: "p.kowalczyk@example.com",
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    specialization: "Systemy wbudowane",
    availableSlots: 1,
    totalSlots: 5,
    tags: ["Embedded Systems", "IoT", "Hardware"],
  },
  {
    id: 6,
    name: "dr inż. Magdalena Nowakowska",
    email: "m.nowakowska@example.com",
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    specialization: "Grafika komputerowa",
    availableSlots: 4,
    totalSlots: 8,
    tags: ["Computer Graphics", "3D Modeling", "Visualization"],
  },
  {
    id: 7,
    name: "dr hab. Krzysztof Adamski",
    email: "k.adamski@example.com",
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    specialization: "Bazy danych",
    availableSlots: 0,
    totalSlots: 6,
    tags: ["Databases", "SQL", "NoSQL"],
  },
  {
    id: 8,
    name: "dr Joanna Kamińska",
    email: "j.kaminska@example.com",
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    specialization: "Interakcja człowiek-komputer",
    availableSlots: 2,
    totalSlots: 5,
    tags: ["HCI", "UX/UI", "Accessibility"],
  },
]
