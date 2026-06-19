import { Bell } from "lucide-react";
import { AppShell } from "@/components/AppShell";
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
import { EmptyState } from "@/components/ui/empty-state";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getDashboardSnapshot } from "@/lib/workspace";

export default async function NotificationsPage() {
  const user = await requireAuthenticatedUser();
  const snapshot = await getDashboardSnapshot(user.id);

  return (
    <AppShell active="/notifications" eyebrow="Centre d'activité" title="Notifications">
      <Card>
        <CardHeader>
          <div className="card-header-inline">
            <div>
              <CardTitle>Notifications intelligentes</CardTitle>
              <CardDescription>Relances, signatures, paiements et points d&apos;attention</CardDescription>
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
              action={<Button size="sm" variant="secondary">Continuer le travail</Button>}
              description="Les notifications apparaîtront ici dès que l'espace détectera des signatures, paiements ou relances à traiter."
              icon={<Bell size={18} />}
              title="Aucune notification pour le moment"
            />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
