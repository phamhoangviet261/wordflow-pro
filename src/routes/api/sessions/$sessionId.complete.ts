import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth/session";

export const Route = createFileRoute("/api/sessions/$sessionId/complete")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const { sessionId } = params;
        const session = await getAuthSession();
        const userId = session?.data.user?.userId;

        if (!userId) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: { code: "UNAUTHORIZED", message: "Login required." },
            }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          );
        }

        try {
          const body = await request.json();
          const { correct, total } = body;

          // 1. Calculate Rewards
          // Logic: 5 XP per correct answer + 20 base XP
          const correctXp = correct * 5;
          const bonusXp = 20 + correct * 2;
          const totalXp = correctXp + bonusXp;

          const totalCoins = 10 + correct * 3;

          // 2. Update User Profile (XP, Coins, Level)
          const user = await db.user.update({
            where: { id: userId },
            data: {
              xp: { increment: totalXp },
              coins: { increment: totalCoins },
            },
          });

          // 3. Update Session Record
          await db.practiceSession.update({
            where: { id: sessionId },
            data: {
              correct,
              total,
              xpEarned: totalXp,
              coinsEarned: totalCoins,
              completedAt: new Date(),
            },
          });

          // 4. Progress Quest q4 (Play any game)
          const activeQuests = await db.userQuest.findMany({
            where: {
              userId,
              completed: false,
              template: { questKey: "q4" },
            },
          });

          for (const uq of activeQuests) {
            await db.userQuest.update({
              where: { id: uq.id },
              data: {
                progress: { increment: 1 },
                completed: uq.progress + 1 >= 1, // q4 goal is usually 1
              },
            });
          }

          // 5. Update Gamification (Streak)
          const gamification = await db.gamification.upsert({
            where: { userId },
            update: {
              streak: { increment: 1 },
              lastActiveDay: new Date(),
            },
            create: {
              userId,
              streak: 1,
              lastActiveDay: new Date(),
            },
          });

          return new Response(
            JSON.stringify({
              ok: true,
              data: {
                sessionId,
                xpEarned: totalXp,
                coinsEarned: totalCoins,
                correct,
                total,
                streak: gamification.streak,
              },
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (error: any) {
          console.error(`[api/sessions/${sessionId}/complete] Error:`, error);
          return new Response(
            JSON.stringify({
              ok: false,
              error: { code: "INTERNAL_ERROR", message: "Failed to complete session." },
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
