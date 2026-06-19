import Link from "next/link";
import { ArrowUpRight, Command, Search, Sparkles } from "lucide-react";
import { AppShellProviders } from "@/components/AppShellProviders";
import { MotionReveal } from "@/components/MotionReveal";
import { ThemeToggle } from "@/components/ThemeToggle";
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
          <Link className="saas-brand" href="/">
            <span className="saas-brand-mark">W</span>
            <div>
              <strong>Welix</strong>
              <span>CRM artisans premium</span>
            </div>
          </Link>

          <nav className="saas-nav">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className={`saas-nav-link ${active === item.href ? "active" : ""}`}
                  href={item.href}
                  key={item.href}
                >
                  <Icon size={17} strokeWidth={2.1} />
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
            <p>Prépare les devis, accélère les relances et garde une vision claire du pipeline.</p>
          </div>
        </aside>

        <section className="saas-workspace">
          <header className="saas-header">
            <div>
              <p className="section-kicker">{eyebrow}</p>
              <h1>{title}</h1>
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

          <MotionReveal>{children}</MotionReveal>
        </section>
      </main>
    </AppShellProviders>
  );
}
