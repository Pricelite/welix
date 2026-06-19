import { BadgeCheck, Camera, Mail } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getAccountSnapshot } from "@/lib/billing";

function getInitials(input: string) {
  return input
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function ProfilePage() {
  const user = await requireAuthenticatedUser();
  const { profile } = await getAccountSnapshot(user.id);

  const companyName = profile?.company_name || "Votre entreprise";
  const fullName = profile?.full_name || companyName;
  const title = profile?.trade ? `${profile.trade} - ${companyName}` : companyName;
  const details = [
    { label: "Nom", value: fullName },
    { label: "Entreprise", value: companyName },
    { label: "Métier principal", value: profile?.trade || "À compléter" },
    { label: "Email", value: profile?.email || user.email || "À compléter" },
    { label: "Téléphone", value: profile?.phone || "À compléter" },
    { label: "Adresse", value: profile?.address || "À compléter" },
  ];

  return (
    <AppShell active="/profil" eyebrow="Compte artisan" title="Profil utilisateur">
      <section className="profile-layout">
        <aside className="workspace-panel profile-card">
          <div className="profile-avatar">
            {getInitials(fullName || companyName || "WU")}
            <button className="icon-button" aria-label="Changer la photo">
              <Camera size={15} />
            </button>
          </div>
          <h2>{fullName}</h2>
          <p>{title}</p>
          <span className="status status-accepte">
            <BadgeCheck size={14} />
            Profil synchronisé
          </span>
        </aside>

        <section className="workspace-panel">
          <div className="panel-title">
            <h2>Informations</h2>
            <button className="secondary-button small-button">
              <Mail size={16} />
              Contacter
            </button>
          </div>
          <dl className="profile-details">
            {details.map((detail) => (
              <div key={detail.label}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </section>
    </AppShell>
  );
}
