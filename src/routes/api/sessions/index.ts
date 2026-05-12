import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth/session";

export const Route = createFileRoute("/api/sessions/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
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
          const { gameMode = "flashcard", vocabSetId, wordIds, wordCount = 8 } = body;

          let wordsToPractice: any[] = [];

          if (wordIds && wordIds.length > 0) {
            // 1. Practice specific words
            wordsToPractice = await db.dictionaryWord.findMany({
              where: { id: { in: wordIds } },
            });
          } else if (vocabSetId && vocabSetId !== "all") {
            // 2. Practice specific set
            const set = await db.vocabSet.findUnique({
              where: { id: vocabSetId },
              include: {
                words: {
                  include: { word: true },
                },
              },
            });
            wordsToPractice = set?.words.map((sw) => sw.word) || [];
          } else {
            // 3. Default: Practice unlearned words or random
            const userWords = await db.userWord.findMany({
              where: { userId, learned: false },
              take: wordCount,
              include: { word: true },
            });
            wordsToPractice = userWords.map((uw) => uw.word);

            if (wordsToPractice.length < wordCount) {
              const moreWords = await db.dictionaryWord.findMany({
                where: {
                  id: { notIn: wordsToPractice.map((w) => w.id) },
                },
                take: wordCount - wordsToPractice.length,
              });
              wordsToPractice = [...wordsToPractice, ...moreWords];
            }
          }

          // Shuffle if needed, or just take wordCount
          wordsToPractice = wordsToPractice.slice(0, wordCount);

          // Create session record
          const practiceSession = await db.practiceSession.create({
            data: {
              userId,
              gameMode: gameMode.toLowerCase() as any,
              total: wordsToPractice.length,
              startedAt: new Date(),
            },
          });

          return new Response(
            JSON.stringify({
              ok: true,
              data: {
                sessionId: practiceSession.id,
                gameMode: practiceSession.gameMode,
                words: wordsToPractice,
                startedAt: practiceSession.startedAt,
              },
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (error: any) {
          console.error("[api/sessions] POST Error:", error);
          return new Response(
            JSON.stringify({
              ok: false,
              error: { code: "INTERNAL_ERROR", message: "Failed to start session." },
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
