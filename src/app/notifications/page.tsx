import { Bell, CheckCircle2, Clock3 } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const notifications = [
  {
    title: "Devis accepté",
    detail: "Atelier Moreau a validé DEV-2026-047.",
    time: "Il y a 8 min",
  },
  {
    title: "Relance à envoyer",
    detail: "Cabinet Martin n'a pas répondu depuis 7 jours.",
    time: "Aujourd'hui",
  },
  {
    title: "Facture payée",
    detail: "Maison Laurent a réglé FAC-2026-018.",
    time: "Hier",
  },
];

export default function NotificationsPage() {
  return (
    <AppShell active="/notifications" eyebrow="Centre d'activité" title="Notifications">
      <section className="workspace-panel recent-activity-panel">
        <div className="panel-title">
          <div>
            <h2>Notifications intelligentes</h2>
            <p>Relances, signatures, paiements et actions importantes.</p>
          </div>
          <Bell size={18} />
        </div>
        <div className="notification-list">
          {notifications.map((notification, index) => (
            <article className="notification-item" key={notification.title}>
              {index === 0 ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
              <div>
                <strong>{notification.title}</strong>
                <p>{notification.detail}</p>
              </div>
              <time>{notification.time}</time>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
