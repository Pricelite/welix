import Link from "next/link";
import {
  ArrowRight,
  CircleDollarSign,
  FilePlus2,
  FileText,
  UsersRound,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";

const metrics = [
  {
    label: "Nombre de devis",
    value: "48",
    detail: "+12 ce mois-ci",
    icon: FileText,
  },
  {
    label: "Montant total facturé",
    value: "42 860 EUR",
    detail: "+18% vs. mois dernier",
    icon: CircleDollarSign,
  },
  {
    label: "Nombre de clients",
    value: "126",
    detail: "8 nouveaux clients",
    icon: UsersRound,
  },
  {
    label: "Devis en attente",
    value: "9",
    detail: "3 relances prévues",
    icon: FilePlus2,
  },
];

const monthlyData = [
  { month: "Jan", value: 42 },
  { month: "Fév", value: 58 },
  { month: "Mar", value: 46 },
  { month: "Avr", value: 74 },
  { month: "Mai", value: 62 },
  { month: "Juin", value: 88 },
];

const activity = [
  {
    title: "Devis envoyé à Maison Laurent",
    detail: "Rénovation salle de bain",
    time: "Il y a 12 min",
  },
  {
    title: "Paiement confirmé",
    detail: "Atelier Moreau - acompte 30%",
    time: "Il y a 1 h",
  },
  {
    title: "Nouveau client ajouté",
    detail: "SCI Bellevue",
    time: "Hier",
  },
  {
    title: "Relance programmée",
    detail: "Cabinet Martin",
    time: "Hier",
  },
];

const latestQuotes = [
  {
    id: "DEV-2026-048",
    client: "Maison Laurent",
    amount: "3 840 EUR",
    date: "17 juin",
    status: "Envoyé",
    statusClass: "status-envoyé",
  },
  {
    id: "DEV-2026-047",
    client: "Atelier Moreau",
    amount: "2 190 EUR",
    date: "15 juin",
    status: "Accepté",
    statusClass: "status-accepté",
  },
  {
    id: "DEV-2026-046",
    client: "SCI Bellevue",
    amount: "6 420 EUR",
    date: "13 juin",
    status: "Brouillon",
    statusClass: "status-brouillon",
  },
  {
    id: "DEV-2026-045",
    client: "Cabinet Martin",
    amount: "4 760 EUR",
    date: "10 juin",
    status: "Relance",
    statusClass: "status-relance",
  },
];

export default function DashboardPage() {
  return (
    <AppShell
      active="/dashboard"
      eyebrow="Vue générale"
      title="Tableau de bord"
    >
      <section className="dashboard-hero-panel">
        <div>
          <p className="section-kicker">Aujourd&apos;hui</p>
          <h2>Une vue claire sur vos devis, clients et revenus.</h2>
        </div>
        <Link className="primary-button large-button" href="/devis/nouveau">
          Créer un devis
          <ArrowRight size={18} />
        </Link>
      </section>

      <section className="dashboard-metrics-grid" aria-label="Indicateurs">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className="dashboard-metric-card" key={metric.label}>
              <div>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </div>
              <Icon size={19} />
            </article>
          );
        })}
      </section>

      <section className="dashboard-content-grid">
        <article className="workspace-panel monthly-chart-panel">
          <div className="panel-title">
            <div>
              <h2>Graphique mensuel</h2>
              <p>Montant facturé sur les 6 derniers mois</p>
            </div>
            <span className="status status-accepté">+18%</span>
          </div>
          <div className="monthly-chart" aria-label="Graphique mensuel">
            {monthlyData.map((item) => (
              <div className="chart-column" key={item.month}>
                <div className="chart-track">
                  <span style={{ height: `${item.value}%` }} />
                </div>
                <small>{item.month}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="workspace-panel recent-activity-panel">
          <div className="panel-title">
            <h2>Activité récente</h2>
          </div>
          <div className="linear-activity-list">
            {activity.map((item) => (
              <div className="linear-activity-item" key={item.title}>
                <span className="activity-dot" />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
                <time>{item.time}</time>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="workspace-panel latest-quotes-panel">
        <div className="panel-title">
          <div>
            <h2>Derniers devis</h2>
            <p>Suivi rapide des devis les plus récents</p>
          </div>
          <Link href="/devis">
            Voir tout
            <ArrowRight size={15} />
          </Link>
        </div>
        <div className="linear-table">
          {latestQuotes.map((quote) => (
            <div className="linear-table-row" key={quote.id}>
              <span>{quote.id}</span>
              <strong>{quote.client}</strong>
              <span>{quote.date}</span>
              <span>{quote.amount}</span>
              <span className={`status ${quote.statusClass}`}>{quote.status}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
