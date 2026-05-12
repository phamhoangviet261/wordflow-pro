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
      POST: async ({ request }) => {
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
          const body = await request.json();
          const { title, description, color, wordIds, difficulty, tags } = body;

          if (!title || !title.trim()) {
            return new Response(
              JSON.stringify({
                ok: false,
                error: { code: "VALIDATION_ERROR", message: "Title is required." },
              }),
              { status: 422, headers: { "Content-Type": "application/json" } },
            );
          }

          // 1. Create the VocabSet
          const newSet = await db.vocabSet.create({
            data: {
              title: title.trim(),
              description: description || null,
              color: color || "from-green-400 to-emerald-500",
              createdBy: userId,
              isSystem: false,
              isPublic: true,
              status: "published",
              difficulty: difficulty || null,
              tags: tags || [],
              // 2. Connect words via join table
              words: {
                create: (wordIds || []).map((id: string) => ({
                  wordId: id,
                })),
              },
            },
            include: {
              words: true,
              _count: {
                select: { words: true },
              },
            },
          });

          // 3. Automatically unlock for the creator
          await db.userVocabSet.create({
            data: {
              userId: userId,
              vocabSetId: newSet.id,
              progressPercent: 0,
              isFavorite: false,
            },
          });

          return new Response(
            JSON.stringify({
              ok: true,
              data: {
                id: newSet.id,
                title: newSet.title,
                description: newSet.description,
                color: newSet.color,
                wordIds: newSet.words.map((w) => w.wordId),
                total: newSet._count.words,
                learned: 0,
                isSystem: newSet.isSystem,
                createdAt: newSet.createdAt.toISOString(),
                updatedAt: newSet.updatedAt.toISOString(),
              },
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (error: any) {
          console.error("[api/vocab-sets] Error creating set:", error);
          return new Response(
            JSON.stringify({
              ok: false,
              error: { code: "INTERNAL_ERROR", message: "Failed to create vocabulary set." },
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
