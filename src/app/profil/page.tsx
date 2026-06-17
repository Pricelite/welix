import { BadgeCheck, Camera, Mail } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { profileDetails } from "@/lib/data";

export default function ProfilePage() {
  return (
    <AppShell active="/profil" eyebrow="Compte artisan" title="Profil utilisateur">
      <section className="profile-layout">
        <aside className="workspace-panel profile-card">
          <div className="profile-avatar">
            AB
            <button className="icon-button" aria-label="Changer la photo">
              <Camera size={15} />
            </button>
          </div>
          <h2>Antoine Bernard</h2>
          <p>Gérant - Bernard Rénovation</p>
          <span className="status status-accepté">
            <BadgeCheck size={14} />
            Profil vérifié
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
            {profileDetails.map((detail) => (
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
