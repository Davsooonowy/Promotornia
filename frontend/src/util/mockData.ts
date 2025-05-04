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

export interface Thesis {
  id: number
  title: string
  promoter: string
  promoterId: number
  department: string
  status: "Dostępny" | "Zarezerwowany"
  isPublic: boolean
  tags: string[]
  reservedBy: string | null
  createdAt: string
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

export const mockTheses: Thesis[] = [
  {
    id: 1,
    title: "Analiza algorytmów uczenia maszynowego w detekcji cyberataków",
    promoter: "dr inż. Katarzyna Kowalska",
    promoterId: 1,
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    status: "Dostępny",
    isPublic: true,
    tags: ["AI", "Cyberbezpieczeństwo", "ML"],
    reservedBy: null,
    createdAt: "2023-05-15",
  },
  {
    id: 2,
    title: "Implementacja i analiza wydajności algorytmów kryptograficznych w systemach IoT",
    promoter: "prof. dr hab. Jan Nowak",
    promoterId: 2,
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    status: "Zarezerwowany",
    isPublic: true,
    tags: ["IoT", "Kryptografia", "Bezpieczeństwo"],
    reservedBy: "Anna Kowalczyk",
    createdAt: "2023-04-20",
  },
  {
    id: 3,
    title: "Projektowanie responsywnych interfejsów użytkownika z wykorzystaniem React i TailwindCSS",
    promoter: "dr Tomasz Wiśniewski",
    promoterId: 3,
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    status: "Dostępny",
    isPublic: false,
    tags: ["Frontend", "React", "UI/UX"],
    reservedBy: null,
    createdAt: "2023-06-10",
  },
  {
    id: 4,
    title: "Analiza i implementacja systemów rekomendacyjnych w e-commerce",
    promoter: "dr hab. Anna Malinowska",
    promoterId: 4,
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    status: "Dostępny",
    isPublic: true,
    tags: ["E-commerce", "Recommendation Systems", "Data Mining"],
    reservedBy: null,
    createdAt: "2023-05-05",
  },
  {
    id: 5,
    title: "Zastosowanie blockchain w systemach zarządzania łańcuchem dostaw",
    promoter: "prof. dr hab. Piotr Kowalczyk",
    promoterId: 5,
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    status: "Zarezerwowany",
    isPublic: true,
    tags: ["Blockchain", "Supply Chain", "Distributed Systems"],
    reservedBy: "Michał Nowak",
    createdAt: "2023-03-15",
  },
  {
    id: 6,
    title: "Metody detekcji anomalii w sieciach komputerowych z wykorzystaniem uczenia maszynowego",
    promoter: "dr inż. Magdalena Nowakowska",
    promoterId: 6,
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    status: "Dostępny",
    isPublic: true,
    tags: ["Network Security", "Anomaly Detection", "Machine Learning"],
    reservedBy: null,
    createdAt: "2023-06-20",
  },
  {
    id: 7,
    title: "Optymalizacja wydajności aplikacji webowych z wykorzystaniem technik Progressive Web App",
    promoter: "dr hab. Krzysztof Adamski",
    promoterId: 7,
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    status: "Zarezerwowany",
    isPublic: true,
    tags: ["Web Development", "PWA", "Performance Optimization"],
    reservedBy: "Karolina Wiśniewska",
    createdAt: "2023-04-10",
  },
  {
    id: 8,
    title: "Projektowanie i implementacja systemów rozpoznawania mowy dla języka polskiego",
    promoter: "dr Joanna Kamińska",
    promoterId: 8,
    department: "Katedra Informatyki/Cyberbezpieczeństwo",
    status: "Dostępny",
    isPublic: true,
    tags: ["Speech Recognition", "NLP", "Polish Language"],
    reservedBy: null,
    createdAt: "2023-05-25",
  },
]

export const getTagsFromSupervisors = (supervisors: Supervisor[]): string[] => {
  return Array.from(new Set(supervisors.flatMap((supervisor) => supervisor.tags)))
}

export const getTagsFromTheses = (theses: Thesis[]): string[] => {
  return Array.from(new Set(theses.flatMap((thesis) => thesis.tags)))
}
