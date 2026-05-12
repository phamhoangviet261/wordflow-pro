import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth/session";

export const Route = createFileRoute("/api/words/bulk")({
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
            { status: 401, headers: { "Content-Type": "application/json" } },
          );
        }

        try {
          const body = await request.json();
          const lines: string[] = body.lines || [];

          let added = 0;
          let skipped = 0;

          for (const line of lines) {
            const parts = line.split("|").map((s) => s?.trim());
            
            // Format: word | phonetic | meaning | type | example
            const [word, phonetic, meaning, typeRaw, example] = parts;

            if (!word || !meaning) {
              skipped++;
              continue;
            }

            const type = (["NOUN", "VERB", "ADJ", "ADV"].includes(typeRaw) ? typeRaw : "NOUN") as any;

            try {
              // 1. Find or create DictionaryWord
              let dictWord = await db.dictionaryWord.findUnique({
                where: {
                  word_type: { word: word, type: type },
                },
              });

              if (!dictWord) {
                dictWord = await db.dictionaryWord.create({
                  data: {
                    word: word,
                    meaning: meaning,
                    type: type,
                    phonetic: phonetic || `/${word}/`,
                    example: example || null,
                  },
                });
              }

              // 2. Check UserWord
              const existingUserWord = await db.userWord.findUnique({
                where: {
                  userId_wordId: {
                    userId: userId,
                    wordId: dictWord.id,
                  },
                },
              });

              if (existingUserWord) {
                skipped++;
                continue;
              }

              // 3. Create UserWord
              await db.userWord.create({
                data: {
                  userId: userId,
                  wordId: dictWord.id,
                  learned: false,
                },
              });

              added++;
            } catch (err) {
              console.error(`[bulk] Failed to add word: ${word}`, err);
              skipped++;
            }
          }

          return new Response(
            JSON.stringify({
              ok: true,
              data: { added, skipped },
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (error: any) {
          console.error("[api/words/bulk] Error:", error);
          return new Response(
            JSON.stringify({
              ok: false,
              error: { code: "INTERNAL_ERROR", message: "Bulk import failed." },
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
