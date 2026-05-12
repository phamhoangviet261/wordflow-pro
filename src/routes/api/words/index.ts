import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth/session";

export const Route = createFileRoute("/api/words/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
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

        const url = new URL(request.url);
        const q = url.searchParams.get("q") || "";
        const type = url.searchParams.get("type") || "ALL";
        const status = url.searchParams.get("status") || "all";
        const sortBy = url.searchParams.get("sortBy") || "word";
        const sortDir = url.searchParams.get("sortDir") || "asc";
        const page = parseInt(url.searchParams.get("page") || "1");
        const pageSize = parseInt(url.searchParams.get("pageSize") || "10");

        try {
          const skip = (page - 1) * pageSize;

          // Define filters
          const where: any = {
            userId: userId,
            word: {},
          };

          if (q) {
            where.word.OR = [
              { word: { contains: q, mode: "insensitive" } },
              { meaning: { contains: q, mode: "insensitive" } },
            ];
          }

          if (type !== "ALL") {
            where.word.type = type;
          }

          if (status === "learned") {
            where.learned = true;
          } else if (status === "not") {
            where.learned = false;
          }

          // Define sorting
          const orderBy: any = {};
          if (sortBy === "learned") {
            orderBy.learned = sortDir;
          } else {
            orderBy.word = { [sortBy]: sortDir };
          }

          const [[items, total], learnedCount, globalTotal] = await Promise.all([
            Promise.all([
              db.userWord.findMany({
                where,
                include: { word: true },
                orderBy,
                skip,
                take: pageSize,
              }),
              db.userWord.count({ where }),
            ]),
            db.userWord.count({
              where: {
                userId: userId,
                learned: true,
              },
            }),
            db.userWord.count({
              where: {
                userId: userId,
              },
            }),
          ]);

          const formattedItems = items.map((uw) => ({
            id: uw.word.id,
            word: uw.word.word,
            phonetic: uw.word.phonetic,
            meaning: uw.word.meaning,
            type: uw.word.type,
            example: uw.word.example,
            learned: uw.learned,
            difficulty: uw.word.difficulty,
            tags: uw.word.tags,
            createdAt: uw.word.createdAt,
            updatedAt: uw.word.updatedAt,
          }));

          return new Response(
            JSON.stringify({
              ok: true,
              data: {
                items: formattedItems,
                total,
                globalTotal,
                learnedCount,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
              },
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (error: any) {
          console.error("[api/words] Error listing words:", error);
          return new Response(
            JSON.stringify({
              ok: false,
              error: { code: "INTERNAL_ERROR", message: "Failed to list words." },
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
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
          const { word, meaning, type, phonetic, example, difficulty, tags } = body;

          // Simple validation
          if (!word || !meaning || !type) {
            return new Response(
              JSON.stringify({
                ok: false,
                error: { code: "VALIDATION_ERROR", message: "Missing required fields." },
              }),
              { status: 422, headers: { "Content-Type": "application/json" } },
            );
          }

          // 1. Find or create the word in the dictionary
          let dictWord = await db.dictionaryWord.findUnique({
            where: {
              word_type: { word: word.trim(), type: type },
            },
          });

          if (dictWord) {
            // Check if the user already has this word
            const existingUserWord = await db.userWord.findUnique({
              where: {
                userId_wordId: {
                  userId: userId,
                  wordId: dictWord.id,
                },
              },
            });

            if (existingUserWord) {
              return new Response(
                JSON.stringify({
                  ok: false,
                  error: { code: "CONFLICT", message: "You already have this word in your list." },
                }),
                { status: 409, headers: { "Content-Type": "application/json" } },
              );
            }
          } else {
            dictWord = await db.dictionaryWord.create({
              data: {
                word: word.trim(),
                meaning: meaning.trim(),
                type: type,
                phonetic: phonetic?.trim() || null,
                example: example?.trim() || null,
                difficulty: difficulty || null,
                tags: tags || [],
              },
            });
          }

          // 2. Create the UserWord link
          const userWord = await db.userWord.create({
            data: {
              userId: userId,
              wordId: dictWord.id,
              learned: false,
            },
          });

          return new Response(
            JSON.stringify({
              ok: true,
              data: {
                id: dictWord.id,
                word: dictWord.word,
                phonetic: dictWord.phonetic,
                meaning: dictWord.meaning,
                type: dictWord.type,
                example: dictWord.example,
                learned: userWord.learned,
                difficulty: dictWord.difficulty,
                tags: dictWord.tags,
                createdAt: dictWord.createdAt,
              },
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (error: any) {
          console.error("[api/words] Error creating word:", error);
          return new Response(
            JSON.stringify({
              ok: false,
              error: { code: "INTERNAL_ERROR", message: "Failed to create word." },
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
