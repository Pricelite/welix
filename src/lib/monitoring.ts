import * as Sentry from "@sentry/nextjs";
import { logError, logInfo, logWarn } from "@/lib/logger";

type MonitoringContext = Record<string, unknown>;

function hasSentryDsn() {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
}

export function captureException(error: unknown, context?: MonitoringContext) {
  logError("Unhandled application error", {
    ...context,
    error: error instanceof Error ? error.message : String(error),
  });

  if (hasSentryDsn()) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

export function captureMessage(
  message: string,
  context?: MonitoringContext,
  level: "info" | "warning" | "error" = "info",
) {
  if (level === "error") {
    logError(message, context);
  } else if (level === "warning") {
    logWarn(message, context);
  } else {
    logInfo(message, context);
  }

  if (hasSentryDsn()) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  }
}

export function setMonitoringUser(user: { id?: string | null; email?: string | null }) {
  if (!hasSentryDsn()) {
    return;
  }

  Sentry.setUser({
    id: user.id ?? undefined,
    email: user.email ?? undefined,
  });
}
