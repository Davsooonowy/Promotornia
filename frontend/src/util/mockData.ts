import { ThesisDetails } from "./types"
import { FieldOfStudy } from "./types"

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
    title:
      "Implementacja i analiza wydajności algorytmów kryptograficznych w systemach IoT",
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
    title:
      "Projektowanie responsywnych interfejsów użytkownika z wykorzystaniem React i TailwindCSS",
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
    title:
      "Metody detekcji anomalii w sieciach komputerowych z wykorzystaniem uczenia maszynowego",
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
    title:
      "Optymalizacja wydajności aplikacji webowych z wykorzystaniem technik Progressive Web App",
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
    title:
      "Projektowanie i implementacja systemów rozpoznawania mowy dla języka polskiego",
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

export const mockThesesDetails: ThesisDetails[] = [
  {
    id: 1,
    title: "Analiza algorytmów uczenia maszynowego w detekcji cyberataków",
    description: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum,"Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.

The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.`,
    prerequisitesDescription:
      "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
    supervisor: "dr inż. Katarzyna Kowalska",
    supervisorId: 1,
    fieldOfStudy: {
      id: 1,
      field: "Cyberbezpieczeństwo",
    },
    status: "Zarezerwowany",
    tags: [
      {
        id: 1,
        name: "Cyberbezpieczeństwo",
      },
      {
        id: 2,
        name: "Uczenie maszynowe",
      },
      {
        id: 3,
        name: "Algorytmy",
      },
    ],
    reservedBy: {
      id: 1,
      name: "Jan",
      surname: "Kowalski",
      email: "jkowalski@student.agh.edu.pl",
    },
  },
]

export const getTagsFromSupervisors = (supervisors: Supervisor[]): string[] => {
  return Array.from(
    new Set(supervisors.flatMap((supervisor) => supervisor.tags)),
  )
}

export const getTagsFromTheses = (theses: Thesis[]): string[] => {
  return Array.from(new Set(theses.flatMap((thesis) => thesis.tags)))
}

export const mockFieldsOfStudy: FieldOfStudy[] = [
  {
    id: 1,
    field: "Informatyka",
  },
  {
    id: 2,
    field: "Cyberbezpieczeństwo",
  },
]
