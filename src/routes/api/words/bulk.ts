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

          // 0. Ensure 'Vocabulary Set Starter' exists
          let starterSet = await db.vocabSet.findFirst({
            where: {
              createdBy: userId,
              title: "Vocabulary Set Starter",
            },
          });

          if (!starterSet) {
            starterSet = await db.vocabSet.create({
              data: {
                title: "Vocabulary Set Starter",
                description: "Bộ từ vựng mặc định để lưu trữ tất cả các từ bạn đã thêm.",
                color: "from-blue-400 to-indigo-500",
                createdBy: userId,
                isSystem: false,
                isPublic: false,
                status: "published",
              },
            });

            await db.userVocabSet.create({
              data: {
                userId: userId,
                vocabSetId: starterSet.id,
                progressPercent: 0,
              },
            });
          }

          const starterSetId = starterSet.id;

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

              // 4. Add to 'Vocabulary Set Starter'
              const existingInSet = await db.vocabSetWord.findUnique({
                where: {
                  vocabSetId_wordId: {
                    vocabSetId: starterSetId,
                    wordId: dictWord.id,
                  },
                },
              });

              if (!existingInSet) {
                await db.vocabSetWord.create({
                  data: {
                    vocabSetId: starterSetId,
                    wordId: dictWord.id,
                  },
                });
              }

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
