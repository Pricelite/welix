import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CircleDollarSign,
  FileText,
  Goal,
  ReceiptText,
  Sparkles,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MotionReveal } from "@/components/MotionReveal";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAuthenticatedUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { getDashboardSnapshot } from "@/lib/workspace";

function getStatusTone(status: string): "info" | "success" | "warning" | "neutral" {
  switch (status.toLowerCase()) {
    case "accept\u00e9":
    case "pay\u00e9":
      return "success";
    case "envoy\u00e9":
      return "info";
    case "refus\u00e9":
      return "warning";
    default:
      return "neutral";
  }
}

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();
  const snapshot = await getDashboardSnapshot(user.id);
  const maxRevenue = Math.max(...snapshot.monthlyRevenue.map((item) => item.value), 1);
  const setupMode = snapshot.metrics.clientCount === 0 || snapshot.metrics.quoteCount === 0;

  const metricCards = [
    {
      label: "Chiffre d'affaires",
      value: formatCurrency(snapshot.metrics.revenue),
      detail: "Base facturation consolid\u00e9e",
      icon: CircleDollarSign,
    },
    {
      label: "Clients actifs",
      value: String(snapshot.metrics.clientCount),
      detail: "Hors fiches archivees",
      icon: UsersRound,
    },
    {
      label: "Devis",
      value: String(snapshot.metrics.quoteCount),
      detail: `${snapshot.metrics.pendingQuotes} en attente`,
      icon: FileText,
    },
    {
      label: "Factures",
      value: String(snapshot.metrics.invoiceCount),
      detail: "Suivi financier en cours",
      icon: ReceiptText,
    },
  ];

  const onboardingSteps = [
    {
      title: "Creer la premiere fiche client",
      description: "Commence par une base propre pour centraliser les informations et l'historique.",
      href: "/clients",
      label: "Ouvrir les clients",
    },
    {
      title: "Generer un premier devis",
      description: "Passe d'une note chantier a une proposition presentable en quelques instants.",
      href: "/devis/nouveau",
      label: "Lancer un devis",
    },
    {
      title: "Structurer le suivi commercial",
      description: "Une fois les premiers devis crees, les statuts et notifications prennent le relais.",
      href: "/devis",
      label: "Voir l'historique",
    },
  ];

  return (
    <AppShell active="/dashboard" eyebrow="Pilotage" title="Tableau de bord">
      <div className="premium-dashboard">
        <MotionReveal delay={0.03}>
          <Card className="hero-card">
            <CardContent className="hero-card-content">
              <div>
                <div className="workspace-hero-meta">
                  <Badge tone="success">Espace operationnel</Badge>
                  <Badge tone="info">Vue executive</Badge>
                </div>
                <h2>Un cockpit premium pour piloter la relation client, les devis et la facturation.</h2>
                <p>
                  Welix centralise l&apos;activite reelle de ton espace dans une interface plus nette,
                  plus calme et plus rassurante a consulter au quotidien.
                </p>
                <div className="hero-card-actions">
                  <Link href="/devis/nouveau">
                    <Button size="lg">
                      Creer un devis
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                  <Link href="/clients">
                    <Button size="lg" variant="secondary">
                      Ouvrir les clients
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="hero-card-aside">
                <div>
                  <span>CA disponible</span>
                  <strong>{formatCurrency(snapshot.metrics.revenue)}</strong>
                </div>
                <div>
                  <span>Pipeline</span>
                  <strong>{snapshot.metrics.quoteCount} devis</strong>
                </div>
                <div>
                  <span>Facturation</span>
                  <strong>{snapshot.metrics.invoiceCount} factures</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionReveal>

        {setupMode ? (
          <MotionReveal delay={0.04}>
            <Card className="quickstart-panel">
              <CardHeader>
                <div className="card-header-inline">
                  <div>
                    <CardTitle>Onboarding guide</CardTitle>
                    <CardDescription>Les trois etapes utiles pour mettre l&apos;espace en rythme.</CardDescription>
                  </div>
                  <Badge tone="warning">
                    <Sparkles size={14} />
                    Demarrage
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="quickstart-grid">
                {onboardingSteps.map((step, index) => (
                  <article className="quickstart-card" key={step.title}>
                    <span className="quickstart-step">0{index + 1}</span>
                    <strong>{step.title}</strong>
                    <p>{step.description}</p>
                    <Link href={step.href}>
                      <Button size="sm" variant="ghost">
                        {step.label}
                      </Button>
                    </Link>
                  </article>
                ))}
              </CardContent>
            </Card>
          </MotionReveal>
        ) : null}

        <section className="premium-metrics-grid">
          {metricCards.map((metric, index) => {
            const Icon = metric.icon;

            return (
              <MotionReveal delay={0.05 + index * 0.03} key={metric.label}>
                <Card className="metric-card">
                  <CardContent className="metric-card-content">
                    <div className="metric-copy">
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                      <small>{metric.detail}</small>
                    </div>
                    <div className="metric-icon-shell">
                      <Icon size={18} />
                    </div>
                  </CardContent>
                </Card>
              </MotionReveal>
            );
          })}
        </section>

        <section className="premium-dashboard-grid">
          <MotionReveal delay={0.12}>
            <Card className="chart-card">
              <CardHeader>
                <div className="card-header-inline">
                  <div>
                    <CardTitle>Evolution du chiffre d&apos;affaires</CardTitle>
                    <CardDescription>Six derniers mois glissants</CardDescription>
                  </div>
                  <Badge tone="info">
                    <TrendingUp size={14} />
                    Vue reelle
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="premium-chart">
                  {snapshot.monthlyRevenue.map((item) => (
                    <div className="premium-chart-column" key={item.month}>
                      <div className="premium-chart-track">
                        <span style={{ height: `${Math.max((item.value / maxRevenue) * 100, 6)}%` }} />
                      </div>
                      <strong>{item.month}</strong>
                      <small>{formatCurrency(item.value)}</small>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </MotionReveal>

          <MotionReveal delay={0.15}>
            <Card className="goals-card">
              <CardHeader>
                <div className="card-header-inline">
                  <div>
                    <CardTitle>Objectifs</CardTitle>
                    <CardDescription>Progression calculee sur les donnees actuelles</CardDescription>
                  </div>
                  <Badge tone="warning">
                    <Goal size={14} />
                    En cours
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="goals-stack">
                {snapshot.goals.map((goal) => {
                  const progress = Math.min((goal.current / goal.target) * 100, 100);
                  const currentLabel =
                    goal.unit === "EUR" ? formatCurrency(goal.current) : `${goal.current} ${goal.unit}`;
                  const targetLabel =
                    goal.unit === "EUR" ? formatCurrency(goal.target) : `${goal.target} ${goal.unit}`;

                  return (
                    <div className="goal-row" key={goal.id}>
                      <div className="goal-copy">
                        <strong>{goal.label}</strong>
                        <span>
                          {currentLabel} / {targetLabel}
                        </span>
                      </div>
                      <div className="goal-progress">
                        <span style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </MotionReveal>
        </section>

        <section className="premium-dashboard-grid secondary">
          <MotionReveal delay={0.18}>
            <Card>
              <CardHeader>
                <CardTitle>Activite recente</CardTitle>
                <CardDescription>Dernieres actions utiles a suivre</CardDescription>
              </CardHeader>
              <CardContent className="activity-stack">
                {snapshot.activity.length ? (
                  snapshot.activity.map((item) => (
                    <div className="activity-row" key={item.id}>
                      <div className="activity-dot" />
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.detail}</p>
                      </div>
                      <time>{item.time}</time>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    action={
                      <Link href="/clients">
                        <Button size="sm" variant="secondary">
                          Ajouter un client
                        </Button>
                      </Link>
                    }
                    description="Ajoute des clients, cree des devis ou enregistre des factures pour voir remonter l'activite reelle."
                    icon={<TrendingUp size={18} />}
                    title="Aucune activite recente"
                  />
                )}
              </CardContent>
            </Card>
          </MotionReveal>

          <MotionReveal delay={0.21}>
            <Card>
              <CardHeader>
                <div className="card-header-inline">
                  <div>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Signaux utiles issus de l&apos;espace</CardDescription>
                  </div>
                  <Badge tone="info">
                    <Bell size={14} />
                    {snapshot.notifications.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="notification-stack">
                {snapshot.notifications.length ? (
                  snapshot.notifications.map((notification) => (
                    <div className="notification-shell" key={notification.id}>
                      <Avatar initials={notification.title.slice(0, 1)} />
                      <div>
                        <strong>{notification.title}</strong>
                        <p>{notification.detail}</p>
                      </div>
                      <span>{notification.time}</span>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    description="Les notifications intelligentes apparaitront ici selon les devis acceptes, les factures et les nouveaux clients."
                    icon={<Bell size={18} />}
                    title="Aucune notification"
                  />
                )}
              </CardContent>
            </Card>
          </MotionReveal>
        </section>

        <section className="premium-dashboard-grid tables">
          <MotionReveal delay={0.24}>
            <Card>
              <CardHeader>
                <div className="card-header-inline">
                  <div>
                    <CardTitle>Derniers devis</CardTitle>
                    <CardDescription>Vision commerciale immediate</CardDescription>
                  </div>
                  <Link href="/devis">
                    <Button size="sm" variant="ghost">
                      Voir tout
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={[
                    {
                      key: "quote",
                      header: "Devis",
                      render: (row) => (
                        <div className="table-primary-cell">
                          <strong>{row.quoteNumber}</strong>
                          <span>{row.clientName}</span>
                        </div>
                      ),
                    },
                    {
                      key: "amount",
                      header: "Montant",
                      render: (row) => formatCurrency(row.amount),
                    },
                    {
                      key: "status",
                      header: "Statut",
                      render: (row) => <Badge tone={getStatusTone(row.status)}>{row.status}</Badge>,
                    },
                  ]}
                  empty={
                    <EmptyState
                      action={
                        <Link href="/devis/nouveau">
                          <Button size="sm">Creer un devis</Button>
                        </Link>
                      }
                      description="Les devis enregistres apparaitront ici."
                      icon={<FileText size={18} />}
                      title="Aucun devis"
                    />
                  }
                  rowKey={(row) => row.id}
                  rows={snapshot.latestQuotes}
                />
              </CardContent>
            </Card>
          </MotionReveal>

          <MotionReveal delay={0.27}>
            <Card>
              <CardHeader>
                <div className="card-header-inline">
                  <div>
                    <CardTitle>Dernieres factures</CardTitle>
                    <CardDescription>Suivi de facturation en temps reel</CardDescription>
                  </div>
                  <Link href="/factures">
                    <Button size="sm" variant="ghost">
                      Ouvrir
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={[
                    {
                      key: "invoice",
                      header: "Facture",
                      render: (row) => (
                        <div className="table-primary-cell">
                          <strong>{row.invoiceNumber}</strong>
                          <span>{row.clientName}</span>
                        </div>
                      ),
                    },
                    {
                      key: "amount",
                      header: "Montant",
                      render: (row) => formatCurrency(row.amount),
                    },
                    {
                      key: "status",
                      header: "Statut",
                      render: (row) => <Badge tone={getStatusTone(row.status)}>{row.status}</Badge>,
                    },
                  ]}
                  empty={
                    <EmptyState
                      description="Aucune facture n'est encore remontee dans le CRM."
                      icon={<ReceiptText size={18} />}
                      title="Aucune facture"
                    />
                  }
                  rowKey={(row) => row.id}
                  rows={snapshot.latestInvoices}
                />
              </CardContent>
            </Card>
          </MotionReveal>
        </section>
      </div>
    </AppShell>
  );
}
