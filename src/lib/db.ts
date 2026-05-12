import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configure WebSocket for Node.js environments (local development)
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

/**
 * Vite's `define` plugin statically replaces `import.meta.env.VITE_DATABASE_URL`
 * with the actual string value at transform time.
 */
function getConnectionString(): string | undefined {
  const viteDbUrl = (import.meta.env as any).VITE_DATABASE_URL;
  const processDbUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : undefined;
  const viteProcessDbUrl =
    typeof process !== "undefined" ? process.env.VITE_DATABASE_URL : undefined;

  console.log("[db] Environment Check:", {
    hasViteDbUrl: !!viteDbUrl,
    hasProcessDbUrl: !!processDbUrl,
    hasViteProcessDbUrl: !!viteProcessDbUrl,
  });

  const url = viteDbUrl || processDbUrl || viteProcessDbUrl;

  if (!url) {
    console.error("[db] CRITICAL: No database connection string found!");
  } else {
    // Mask password for safety: postgresql://user:pass@host/db -> postgresql://user:***@host/db
    const masked = url.replace(/(:)([^@/]+)(@)/, "$1***$3");
    console.log("[db] Using connection string:", masked);
  }

  return url;
}

let prisma: PrismaClient | null = null;

function createPrismaClient(): PrismaClient {
  if (prisma) return prisma;

  const connectionString = getConnectionString();

  if (!connectionString) {
    console.warn(
      "[db] No connection string found. Prisma will default to localhost (likely to fail).",
    );
    prisma = new PrismaClient();
    return prisma;
  }

  try {
    console.log("[db] Explicitly setting process.env.DATABASE_URL for internal Prisma checks");
    if (typeof process !== "undefined") {
      process.env.DATABASE_URL = connectionString;
    }

    console.log("[db] Initializing Pool with connectionString...");
    const pool = new Pool({ connectionString });

    console.log("[db] Creating PrismaNeon adapter...");
    const adapter = new PrismaNeon({ connectionString });

    console.log("[db] Creating PrismaClient with adapter and logging enabled...");
    prisma = new PrismaClient({
      adapter,
      log: ["query", "error", "info", "warn"],
    });

    console.log("[db] PrismaClient instance created successfully.");
    return prisma;
  } catch (err) {
    console.error("[db] Failed to initialize PrismaClient:", err);
    throw err;
  }
}

/**
 * Export a Proxy that lazily initializes the PrismaClient on first access.
 * This solves timing issues with environment variables in SSR/Edge environments.
 */
export const db = new Proxy({} as PrismaClient, {
  get: (target, prop, receiver) => {
    const client = createPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
