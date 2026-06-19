import {
  Bell,
  Building2,
  CreditCard,
  FilePlus2,
  Files,
  LayoutDashboard,
  Mail,
  ReceiptText,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
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
