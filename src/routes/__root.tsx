import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Không tìm thấy trang</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Trang bạn đang tìm không tồn tại hoặc đã được di chuyển.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Về trang chủ
          </Link>
          <Link
            to="/vocab/sets"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Bộ từ vựng
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-8">
        <div className="mx-auto size-20 rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center mb-5 text-4xl">
          ⚠️
        </div>
        <div className="text-xs font-bold tracking-widest text-blue-600">LỖI 500</div>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-800">Trang chưa tải được</h1>
        <p className="mt-2 text-sm text-slate-500">
          Đã có sự cố khi tải dữ liệu. Bạn có thể thử lại hoặc quay về danh sách bộ từ vựng.
        </p>
        {error?.message && (
          <p className="mt-3 text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2 break-words">
            {error.message}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition shadow-md"
          >
            Thử lại
          </button>
          <Link
            to="/vocab/sets"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition"
          >
            Bộ từ vựng
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition"
          >
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Vocalab App" },
      {
        name: "description",
        content:
          "VocaLab is an interactive web app for mastering vocabulary through structured learning and engaging games.",
      },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Vocalab App" },
      {
        property: "og:description",
        content:
          "VocaLab is an interactive web app for mastering vocabulary through structured learning and engaging games.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Vocalab App" },
      {
        name: "twitter:description",
        content:
          "VocaLab is an interactive web app for mastering vocabulary through structured learning and engaging games.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0a59e8dc-b586-4032-93a4-ee1afb3fdda8/id-preview-da46822f--cf076082-e2ec-4967-9a6c-40e1ac0f4c25.lovable.app-1778434387404.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0a59e8dc-b586-4032-93a4-ee1afb3fdda8/id-preview-da46822f--cf076082-e2ec-4967-9a6c-40e1ac0f4c25.lovable.app-1778434387404.png",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
