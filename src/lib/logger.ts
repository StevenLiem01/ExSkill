import prisma from "@/lib/prisma";
import { LogLevel, LogCategory } from "@prisma/client";

interface LogParams {
  level?: LogLevel;
  category?: LogCategory;
  action: string;
  details?: string | object;
  userId?: string | null;
  ipAddress?: string | null;
}

/**
 * Utility function to write logs to the database.
 * Does not block execution (fire-and-forget).
 */
export async function logActivity({
  level = LogLevel.INFO,
  category = LogCategory.SYSTEM,
  action,
  details,
  userId = null,
  ipAddress = null,
}: LogParams): Promise<void> {
  try {
    const detailsString =
      typeof details === "object" ? JSON.stringify(details) : details || null;

    // Fire and forget so we don't hold up the main thread
    prisma.systemLog
      .create({
        data: {
          level,
          category,
          action,
          details: detailsString,
          user_id: userId,
          ip_address: ipAddress,
        },
      })
      .catch((err: any) => {
        console.error("Failed to write to SystemLog:", err);
      });
  } catch (error: any) {
    console.error("Critical failure in logger utility:", error);
  }
}
