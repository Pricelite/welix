type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

function serializeContext(context?: LogContext) {
  if (!context) {
    return undefined;
  }

  try {
    return JSON.stringify(context);
  } catch {
    return "[unserializable-context]";
  }
}

function write(level: LogLevel, message: string, context?: LogContext) {
  const payload = serializeContext(context);
  const timestamp = new Date().toISOString();
  const line = payload ? `[${timestamp}] ${level.toUpperCase()} ${message} ${payload}` : `[${timestamp}] ${level.toUpperCase()} ${message}`;

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
}

export function logInfo(message: string, context?: LogContext) {
  write("info", message, context);
}

export function logWarn(message: string, context?: LogContext) {
  write("warn", message, context);
}

export function logError(message: string, context?: LogContext) {
  write("error", message, context);
}
