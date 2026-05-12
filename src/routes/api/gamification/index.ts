import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth/session";

export const Route = createFileRoute("/api/gamification/")({
  server: {
    handlers: {
      GET: async () => {
        const session = await getAuthSession();
        const userId = session?.data.user?.userId;

        if (!userId) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: {
                code: "UNAUTHORIZED",
                message: "You must be logged in to view gamification data.",
              },
            }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        try {
          // Fetch user basic gamification stats (xp, level, coins)
          const user = await db.user.findUnique({
            where: { id: userId },
            select: { xp: true, level: true, coins: true },
          });

          if (!user) {
            return new Response(
              JSON.stringify({
                ok: false,
                error: { code: "NOT_FOUND", message: "User not found." },
              }),
              { status: 404, headers: { "Content-Type": "application/json" } },
            );
          }

          // Fetch streak data
          let gamification = await db.gamification.findUnique({
            where: { userId },
          });

          // Create gamification record if it doesn't exist
          if (!gamification) {
            gamification = await db.gamification.create({
              data: { userId },
            });
          }

          // Fetch today's quests
          const today = new Date().toISOString().slice(0, 10);
          const quests = await db.userQuest.findMany({
            where: {
              userId,
              assignedDate: new Date(today),
            },
            include: {
              template: true,
            },
          });

          // Fetch inventory
          const inventoryItems = await db.userInventoryItem.findMany({
            where: { userId },
            include: {
              item: true,
            },
          });

          const formattedQuests = quests.map((q) => ({
            id: q.id,
            progress: q.progress,
            completed: q.completed,
            claimed: q.claimed,
            assignedDate: q.assignedDate.toISOString().slice(0, 10),
            template: {
              questKey: q.template.questKey,
              title: q.template.title,
              description: q.template.description,
              goal: q.template.goal,
              rewardXp: q.template.rewardXp,
              rewardCoins: q.template.rewardCoins,
            },
          }));

          const responseData = {
            xp: user.xp,
            level: user.level,
            coins: user.coins,
            streak: gamification.streak,
            bestStreak: gamification.bestStreak,
            lastActiveDay: gamification.lastActiveDay
              ? gamification.lastActiveDay.toISOString().slice(0, 10)
              : null,
            quests: formattedQuests,
            inventory: inventoryItems.map((i) => i.item.itemKey),
          };

          return new Response(
            JSON.stringify({
              ok: true,
              data: responseData,
            }),
            {
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (error: any) {
          console.error("[api/gamification] Error:", error);
          return new Response(
            JSON.stringify({
              ok: false,
              error: {
                code: "INTERNAL_ERROR",
                message: "An unexpected error occurred.",
              },
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      },
    },
  },
});
