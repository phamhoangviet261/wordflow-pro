import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/_app/leaderboard")({
  head: () => ({ meta: [{ title: "Xếp hạng — VocabLab" }] }),
  component: () => (
    <div className="max-w-2xl mx-auto text-center py-20">
      <div className="size-16 rounded-3xl bg-yellow-100 text-yellow-600 inline-flex items-center justify-center mb-4"><Trophy className="size-7" /></div>
      <h1 className="text-2xl font-bold text-slate-800">Xếp hạng</h1>
      <p className="text-slate-500 mt-2">Bảng xếp hạng sắp ra mắt.</p>
    </div>
  ),
});
