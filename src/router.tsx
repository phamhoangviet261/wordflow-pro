import { QueryClient } from "@tanstack/react-query";
import { createRouter, Link, useRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function DefaultErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-8">
        <div className="mx-auto size-20 rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center mb-5 text-4xl">⚠️</div>
        <div className="text-xs font-bold tracking-widest text-blue-600">LỖI 500</div>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-800">Trang chưa tải được</h1>
        <p className="mt-2 text-sm text-slate-500">Đã có sự cố khi tải dữ liệu. Bạn có thể thử lại hoặc quay về danh sách bộ từ vựng.</p>
        {error?.message && (
          <p className="mt-3 text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 break-words">{error.message}</p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition shadow-md"
          >
            Thử lại
          </button>
          <Link to="/vocab/sets" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition">
            Bộ từ vựng
          </Link>
        </div>
      </div>
    </div>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent,
  });

  return router;
};
