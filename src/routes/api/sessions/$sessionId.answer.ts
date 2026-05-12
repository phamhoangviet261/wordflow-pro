import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth/session";

export const Route = createFileRoute("/api/sessions/$sessionId/answer")({
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
          const { wordId, result } = body; // result: "correct" | "incorrect"
          const isCorrect = result === "correct";

          // 1. Record the answer
          await db.sessionAnswer.create({
            data: {
              sessionId,
              wordId,
              isCorrect,
              createdAt: new Date(),
            },
          });

          // 2. Update UserWord progress
          // We increment mastery if correct, decrement if incorrect (optional)
          // Also set learned = true if correct
          if (isCorrect) {
            await db.userWord.upsert({
              where: {
                userId_wordId: { userId, wordId },
              },
              update: {
                learned: true,
                mastery: { increment: 1 },
                lastReviewedAt: new Date(),
              },
              create: {
                userId,
                wordId,
                learned: true,
                mastery: 1,
                lastReviewedAt: new Date(),
              },
            });
          } else {
            await db.userWord.upsert({
              where: {
                userId_wordId: { userId, wordId },
              },
              update: {
                mastery: { decrement: 1 },
                lastReviewedAt: new Date(),
              },
              create: {
                userId,
                wordId,
                learned: false,
                mastery: 0,
                lastReviewedAt: new Date(),
              },
            });
          }

          // Note: XP is NOT awarded here per user request to avoid spam.
          // It will be awarded in bulk at /complete.

          return new Response(
            JSON.stringify({
              ok: true,
              data: {
                wordId,
                result,
                xpAwarded: 0, // Explicitly 0 per request
              },
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (error: any) {
          console.error(`[api/sessions/${sessionId}/answer] Error:`, error);
          return new Response(
            JSON.stringify({
              ok: false,
              error: { code: "INTERNAL_ERROR", message: "Failed to record answer." },
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
