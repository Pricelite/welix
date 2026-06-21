import Link from "next/link";
import { ArrowUpRight, Command, Search, Sparkles } from "lucide-react";
import { AppShellProviders } from "@/components/AppShellProviders";
import { MotionReveal } from "@/components/MotionReveal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { navItems } from "@/lib/data";

type AppShellProps = {
  active: string;
  title: string;
  eyebrow: string;
  action?: string;
  children: React.ReactNode;
};

export function AppShell({ active, title, eyebrow, action, children }: AppShellProps) {
  return (
    <AppShellProviders>
      <main className="saas-shell">
        <aside className="saas-sidebar" aria-label="Navigation principale">
          <div className="saas-sidebar-top">
            <Link className="saas-brand" href="/">
              <span className="saas-brand-mark">W</span>
              <div>
                <strong>Welix</strong>
                <span>CRM artisans premium</span>
              </div>
            </Link>

            <div className="saas-sidebar-intro">
              <Badge tone="success">Workspace actif</Badge>
              <p>Un espace plus clair pour suivre le pipeline, les devis et les relances sans friction.</p>
            </div>
          </div>

          <nav className="saas-nav">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className={`saas-nav-link ${active === item.href ? "active" : ""}`}
                  href={item.href}
                  key={item.href}
                >
                  <span className="saas-nav-icon-shell">
                    <Icon size={17} strokeWidth={2.1} />
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="saas-sidebar-card">
            <div className="saas-sidebar-card-head">
              <Sparkles size={16} />
              <span>Assistant IA</span>
            </div>
            <p>Prepare les devis, accelere les relances et garde une vision claire du pipeline.</p>
            <div className="saas-sidebar-card-pills">
              <span>Analyse</span>
              <span>Devis</span>
              <span>Suivi</span>
            </div>
          </div>
        </aside>

        <section className="saas-workspace">
          <header className="saas-header">
            <div className="saas-header-copy">
              <div className="saas-header-kicker-row">
                <p className="section-kicker">{eyebrow}</p>
                <span className="saas-header-dot" aria-hidden="true" />
                <span className="saas-header-caption">Experience premium</span>
              </div>
              <h1>{title}</h1>
              <p className="saas-header-subtitle">
                Une interface plus calme, plus lisible et plus decisive pour piloter l&apos;activite au quotidien.
              </p>
            </div>

            <div className="saas-header-actions">
              <label className="saas-search">
                <Search size={16} />
                <span className="sr-only">Rechercher</span>
                <input placeholder="Rechercher un client, un devis, une facture" />
                <span className="saas-search-shortcut">
                  <Command size={12} />
                  K
                </span>
              </label>
              <ThemeToggle />
              {action ? (
                <Link href="/devis/nouveau">
                  <Button size="md">
                    {action}
                    <ArrowUpRight size={16} />
                  </Button>
                </Link>
              ) : null}
            </div>
          </header>

          <MotionReveal>
            <div className="workspace-stack">{children}</div>
          </MotionReveal>
        </section>
      </main>
    </AppShellProviders>
  );
}
