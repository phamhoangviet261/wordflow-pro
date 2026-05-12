import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth/session";

export const Route = createFileRoute("/api/vocab-sets/")({
  server: {
    handlers: {
      GET: async () => {
        const session = await getAuthSession();

        if (!session?.data.user?.userId) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: {
                code: "UNAUTHORIZED",
                message: "You must be logged in to view vocabulary sets.",
              },
            }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        const userId = session?.data.user?.userId;

        try {
          const sets = await db.vocabSet.findMany({
            where: {
              OR: [{ isSystem: true }, { createdBy: userId }],
            },
            include: {
              words: true,
              _count: {
                select: { words: true },
              },
            },
            orderBy: { createdAt: "desc" },
          });

          // Fetch user progress for these sets
          const userSets = await db.userVocabSet.findMany({
            where: {
              userId: userId,
              vocabSetId: { in: sets.map((s) => s.id) },
            },
          });

          const userSetMap = new Map(userSets.map((us) => [us.vocabSetId, us]));

          const formattedSets = sets.map((s) => {
            const userProgress = userSetMap.get(s.id);
            const total = s._count.words;

            // For now, we'll calculate learned words based on UserWord status
            // This might be expensive if done for every set, but let's start simple
            // In a real app, we might store this in userVocabSets or update it periodically

            return {
              id: s.id,
              title: s.title,
              description: s.description,
              color: s.color,
              wordIds: s.words.map((w) => w.wordId),
              total: total,
              learned: userProgress?.progressPercent
                ? Math.floor((userProgress.progressPercent / 100) * total)
                : 0,
              status: s.status,
              difficulty: s.difficulty,
              tags: s.tags,
              isSystem: s.isSystem,
              createdAt: s.createdAt.toISOString(),
              updatedAt: s.updatedAt.toISOString(),
            };
          });

          return new Response(
            JSON.stringify({
              ok: true,
              data: formattedSets,
            }),
            {
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (error: any) {
          console.error("[api/vocab-sets] Error fetching sets:", error);
          return new Response(
            JSON.stringify({
              ok: false,
              error: {
                code: "INTERNAL_ERROR",
                message: "An unexpected error occurred while fetching vocabulary sets.",
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
