import Link from "next/link";
import { ArrowUpRight, Search, Sparkles } from "lucide-react";
import { navItems } from "@/lib/data";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MotionReveal } from "@/components/MotionReveal";

type AppShellProps = {
  active: string;
  title: string;
  eyebrow: string;
  action?: string;
  children: React.ReactNode;
};

export function AppShell({
  active,
  title,
  eyebrow,
  action,
  children,
}: AppShellProps) {
  return (
    <main className="app-page">
      <aside className="sidebar" aria-label="Navigation principale">
        <Link className="brand brand-sidebar" href="/">
          <span className="brand-mark">W</span>
          <span>Welix</span>
        </Link>

        <nav className="side-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className={`side-link ${active === item.href ? "active" : ""}`}
                href={item.href}
                key={item.href}
              >
                <Icon size={17} strokeWidth={2.2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="assistant-strip">
          <Sparkles size={18} />
          <p>Assistant IA prêt pour chiffrer un chantier à partir de notes terrain.</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <div>
            <p className="section-kicker">{eyebrow}</p>
            <h1>{title}</h1>
          </div>
          <div className="header-actions">
            <label className="search-box">
              <Search size={17} />
              <span className="sr-only">Rechercher</span>
              <input placeholder="Rechercher" />
            </label>
            <ThemeToggle />
            {action ? (
              <Link className="primary-button small-button" href="/devis/nouveau">
                {action}
                <ArrowUpRight size={16} />
              </Link>
            ) : null}
          </div>
        </header>
        <MotionReveal>{children}</MotionReveal>
      </section>
    </main>
  );
}
