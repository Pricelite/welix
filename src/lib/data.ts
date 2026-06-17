import {
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  CreditCard,
  FileCheck2,
  FilePlus2,
  Files,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  ReceiptText,
  Paintbrush,
  PlugZap,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  Wrench,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: UsersRound },
  { href: "/devis/nouveau", label: "Nouveau devis", icon: FilePlus2 },
  { href: "/devis", label: "Historique", icon: Files },
  { href: "/factures", label: "Factures", icon: ReceiptText },
  { href: "/abonnement", label: "Abonnement", icon: CreditCard },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/parametres", label: "Paramètres", icon: Settings },
  { href: "/profil", label: "Profil", icon: UserRound },
];

export const quoteRows = [
  {
    id: "DEV-2026-048",
    client: "Maison Laurent",
    trade: "Plomberie",
    amount: "3 840 EUR",
    status: "Envoyé",
    date: "17 juin 2026",
  },
  {
    id: "DEV-2026-047",
    client: "Atelier Moreau",
    trade: "Électricité",
    amount: "2 190 EUR",
    status: "Accepté",
    date: "15 juin 2026",
  },
  {
    id: "DEV-2026-046",
    client: "SCI Bellevue",
    trade: "Peinture",
    amount: "6 420 EUR",
    status: "Brouillon",
    date: "13 juin 2026",
  },
  {
    id: "DEV-2026-045",
    client: "Cabinet Martin",
    trade: "Menuiserie",
    amount: "4 760 EUR",
    status: "Relance",
    date: "10 juin 2026",
  },
];

export const clientRows = [
  {
    name: "Maison Laurent",
    contact: "Claire Laurent",
    email: "claire@laurent.fr",
    city: "Lyon",
    revenue: "8 230 EUR",
    lastQuote: "DEV-2026-048",
  },
  {
    name: "Atelier Moreau",
    contact: "Hugo Moreau",
    email: "contact@atelier-moreau.fr",
    city: "Nantes",
    revenue: "12 700 EUR",
    lastQuote: "DEV-2026-047",
  },
  {
    name: "SCI Bellevue",
    contact: "Nadia Karim",
    email: "nadia@bellevue.immo",
    city: "Bordeaux",
    revenue: "6 420 EUR",
    lastQuote: "DEV-2026-046",
  },
  {
    name: "Cabinet Martin",
    contact: "Paul Martin",
    email: "paul@cabinet-martin.fr",
    city: "Paris",
    revenue: "4 760 EUR",
    lastQuote: "DEV-2026-045",
  },
];

export const activityItems = [
  {
    title: "Devis plomberie généré",
    detail: "12 lignes de prestations, marge vérifiée",
    time: "Il y a 12 min",
    icon: Wrench,
  },
  {
    title: "Relance programmée",
    detail: "Cabinet Martin - second rappel",
    time: "Il y a 1 h",
    icon: Bell,
  },
  {
    title: "Client créé",
    detail: "SCI Bellevue ajouté depuis un email",
    time: "Hier",
    icon: UsersRound,
  },
];

export const craftTemplates = [
  { label: "Plomberie", icon: Wrench, jobs: "Salle de bain, fuite, ballon" },
  { label: "Électricité", icon: PlugZap, jobs: "Tableau, prise, diagnostic" },
  { label: "Peinture", icon: Paintbrush, jobs: "Murs, plafonds, façade" },
  { label: "Maçonnerie", icon: Building2, jobs: "Dalle, ouverture, reprise" },
];

export const featureCards = [
  {
    title: "Devis IA en minutes",
    text: "Décris le chantier, Welix propose les postes, quantités, marges et mentions utiles.",
    icon: Sparkles,
  },
  {
    title: "Clients centralisés",
    text: "Retrouve l'historique, les relances et les informations chantier au même endroit.",
    icon: UsersRound,
  },
  {
    title: "Suivi commercial",
    text: "Vois ce qui est brouillon, envoyé, accepté ou à relancer sans tableur.",
    icon: BarChart3,
  },
];

export const trustItems = [
  { label: "Factures prêtes", icon: FileCheck2 },
  { label: "Données protégées", icon: ShieldCheck },
  { label: "Support métier", icon: LifeBuoy },
  { label: "Paiement à venir", icon: CreditCard },
];

export const dashboardStats = [
  { label: "Devis ce mois", value: "48", trend: "+18%", icon: ClipboardList },
  { label: "Taux d'acceptation", value: "64%", trend: "+9 pts", icon: CheckCircle2 },
  { label: "CA potentiel", value: "42,8k EUR", trend: "+12%", icon: BarChart3 },
  { label: "Temps économisé", value: "31 h", trend: "estimé", icon: Clock3 },
];

export const profileDetails = [
  { label: "Nom", value: "Antoine Bernard" },
  { label: "Entreprise", value: "Bernard Rénovation" },
  { label: "Métier principal", value: "Plomberie & rénovation" },
  { label: "Email", value: "antoine@bernard-renovation.fr" },
  { label: "Téléphone", value: "+33 6 24 18 75 90" },
  { label: "Adresse", value: "24 rue des Artisans, 69003 Lyon" },
];

export const settingsGroups = [
  {
    title: "Entreprise",
    text: "Coordonnées, SIRET, logo, mentions légales et conditions de paiement.",
    icon: Building2,
  },
  {
    title: "Notifications",
    text: "Relances automatiques, rappels de signature et alertes de devis expirés.",
    icon: Bell,
  },
  {
    title: "Emails",
    text: "Modèles d'envoi, signature, ton commercial et copies internes.",
    icon: Mail,
  },
  {
    title: "Sécurité",
    text: "Mot de passe, double authentification et accès collaborateur.",
    icon: ShieldCheck,
  },
];
