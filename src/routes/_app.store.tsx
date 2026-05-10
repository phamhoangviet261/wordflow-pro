import { createFileRoute } from "@tanstack/react-router";
import { Store } from "lucide-react";

export const Route = createFileRoute("/_app/store")({
  head: () => ({ meta: [{ title: "Cửa hàng — VocabLab" }] }),
  component: () => (
    <div className="max-w-2xl mx-auto text-center py-20">
      <div className="size-16 rounded-3xl bg-orange-100 text-orange-600 inline-flex items-center justify-center mb-4"><Store className="size-7" /></div>
      <h1 className="text-2xl font-bold text-slate-800">Cửa hàng</h1>
      <p className="text-slate-500 mt-2">Tính năng sắp ra mắt.</p>
    </div>
  ),
});
