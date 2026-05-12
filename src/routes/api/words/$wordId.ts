import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth/session";

export const Route = createFileRoute("/api/words/$wordId")({
  server: {
    handlers: {
      DELETE: async ({ params }) => {
        const session = await getAuthSession();
        const userId = session?.data.user?.userId;
        const { wordId } = params;

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
          // Delete the UserWord link (not the DictionaryWord)
          await db.userWord.delete({
            where: {
              userId_wordId: {
                userId: userId,
                wordId: wordId,
              },
            },
          });

          return new Response(JSON.stringify({ ok: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          console.error("[api/words/delete] Error:", error);
          return new Response(
            JSON.stringify({
              ok: false,
              error: { code: "INTERNAL_ERROR", message: "Failed to delete word." },
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
      PATCH: async ({ params, request }) => {
        const session = await getAuthSession();
        const userId = session?.data.user?.userId;
        const { wordId } = params;

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
          const { learned } = body;

          const updated = await db.userWord.update({
            where: {
              userId_wordId: {
                userId: userId,
                wordId: wordId,
              },
            },
            data: {
              learned: !!learned,
            },
          });

          return new Response(
            JSON.stringify({
              ok: true,
              data: updated,
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (error: any) {
          console.error("[api/words/patch] Error:", error);
          return new Response(
            JSON.stringify({
              ok: false,
              error: { code: "INTERNAL_ERROR", message: "Failed to update word." },
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
      PUT: async ({ params, request }) => {
        const session = await getAuthSession();
        const userId = session?.data.user?.userId;
        const { wordId } = params;

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
          const { word, phonetic, meaning, type, example } = body;

          // Ensure the user owns this word link
          const userWord = await db.userWord.findUnique({
            where: {
              userId_wordId: {
                userId,
                wordId,
              },
            },
          });

          if (!userWord) {
            return new Response(
              JSON.stringify({
                ok: false,
                error: { code: "NOT_FOUND", message: "Word not found in your list." },
              }),
              { status: 404, headers: { "Content-Type": "application/json" } },
            );
          }

          // Update the dictionary word
          // Note: In a multi-user environment, we might want to check if others use it,
          // but for now we follow the simple PUT /api/words/:id pattern.
          const updatedWord = await db.dictionaryWord.update({
            where: { id: wordId },
            data: {
              word,
              phonetic,
              meaning,
              type,
              example,
            },
          });

          return new Response(
            JSON.stringify({
              ok: true,
              data: updatedWord,
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (error: any) {
          console.error("[api/words/put] Error:", error);
          
          if (error.code === "P2002") {
            return new Response(
              JSON.stringify({
                ok: false,
                error: { code: "CONFLICT", message: "A word with this name and type already exists." },
              }),
              { status: 409, headers: { "Content-Type": "application/json" } },
            );
          }

          return new Response(
            JSON.stringify({
              ok: false,
              error: { code: "INTERNAL_ERROR", message: "Failed to update word details." },
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
