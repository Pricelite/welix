import { ToggleRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { requireAuthenticatedUser } from "@/lib/auth";
import { settingsGroups } from "@/lib/data";

export default async function SettingsPage() {
  await requireAuthenticatedUser();

  return (
    <AppShell active="/parametres" eyebrow="Configuration" title="Paramètres">
      <section className="settings-grid">
        {settingsGroups.map((group) => {
          const Icon = group.icon;
          return (
            <article className="workspace-panel setting-card" key={group.title}>
              <Icon size={22} />
              <div>
                <h2>{group.title}</h2>
                <p>{group.text}</p>
              </div>
              <button className="icon-button" aria-label={`Activer ${group.title}`}>
                <ToggleRight size={22} />
              </button>
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
