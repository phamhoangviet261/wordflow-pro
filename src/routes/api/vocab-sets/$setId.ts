import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth/session";

export const Route = createFileRoute("/api/vocab-sets/$setId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { setId } = params;
        const session = await getAuthSession();
        const userId = session?.data.user?.userId;

        if (!userId) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: { code: "UNAUTHORIZED", message: "Login required." },
            }),
            { status: 401, headers: { "Content-Type": "application/json" } },
          );
        }

        try {
          const set = await db.vocabSet.findUnique({
            where: { id: setId },
            include: {
              words: {
                include: {
                  word: true,
                },
              },
            },
          });

          if (!set) {
            return new Response(
              JSON.stringify({
                ok: false,
                error: { code: "NOT_FOUND", message: "Vocabulary set not found." },
              }),
              { status: 404, headers: { "Content-Type": "application/json" } },
            );
          }

          // Check if user has access (is creator or is system set)
          // Actually, in the spec, users unlock sets. 
          // For now, let's allow if createdBy === userId OR isSystem === true.
          if (set.createdBy !== userId && !set.isSystem) {
             return new Response(
              JSON.stringify({
                ok: false,
                error: { code: "FORBIDDEN", message: "You don't have access to this set." },
              }),
              { status: 403, headers: { "Content-Type": "application/json" } },
            );
          }

          // Fetch user progress for words in this set
          const userWords = await db.userWord.findMany({
            where: {
              userId: userId,
              wordId: { in: set.words.map((w) => w.wordId) },
            },
          });

          const userWordMap = new Map(userWords.map((uw) => [uw.wordId, uw]));

          const words = set.words.map((sw) => {
            const uw = userWordMap.get(sw.wordId);
            return {
              id: sw.word.id,
              word: sw.word.word,
              phonetic: sw.word.phonetic,
              meaning: sw.word.meaning,
              type: sw.word.type,
              example: sw.word.example,
              learned: uw?.learned || false,
              difficulty: sw.word.difficulty,
              tags: sw.word.tags,
            };
          });

          const total = words.length;
          const learned = words.filter((w) => w.learned).length;

          return new Response(
            JSON.stringify({
              ok: true,
              data: {
                id: set.id,
                title: set.title,
                description: set.description,
                color: set.color,
                words: words,
                total,
                learned,
                isSystem: set.isSystem,
                createdAt: set.createdAt.toISOString(),
                updatedAt: set.updatedAt.toISOString(),
              },
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (error: any) {
          console.error("[api/vocab-sets/$setId] Error:", error);
          return new Response(
            JSON.stringify({
              ok: false,
              error: { code: "INTERNAL_ERROR", message: "Failed to fetch set details." },
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
