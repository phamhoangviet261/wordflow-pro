import { createFileRoute, useSearch } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ERROR_MESSAGES: Record<string, string> = {
  oauth_denied: "Đăng nhập bị từ chối. Vui lòng thử lại.",
  missing_params: "Có lỗi xảy ra. Vui lòng thử lại.",
  state_mismatch: "Yêu cầu không hợp lệ. Vui lòng thử lại.",
  email_not_verified: "Email Google chưa được xác minh.",
  server_error: "Lỗi máy chủ. Vui lòng thử lại sau.",
};

export const Route = createFileRoute("/login")({
  validateSearch: (search) =>
    search as { error?: string; redirect?: string },
  component: LoginPage,
});

function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { error } = useSearch({ from: "/login" });

  // Show error toast if redirected from OAuth with an error
  useEffect(() => {
    if (error && ERROR_MESSAGES[error]) {
      toast.error(ERROR_MESSAGES[error]);
    }
  }, [error]);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-100 rounded-full blur-[100px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[100px] opacity-50" />

      <div className="w-full max-w-md z-10 p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-8 md:p-12 text-center relative border border-white/50 backdrop-blur-sm">
          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="size-20 rounded-[2.2rem] bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-200 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <GraduationCap className="size-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 size-8 rounded-full bg-white shadow-md flex items-center justify-center animate-bounce duration-[2000ms]">
                <span className="text-lg">✨</span>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-3 mb-10">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight italic">
              Voca<span className="text-green-500">Lab</span>
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Làm chủ từ vựng mỗi ngày. <br />
              Đăng nhập để lưu lại tiến trình của bạn!
            </p>
          </div>

          {/* Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="group w-full flex items-center justify-center gap-3 py-4 px-6 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-green-200 hover:text-green-600 transition-all duration-300 shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="size-5 border-2 border-slate-300 border-t-green-500 rounded-full animate-spin" />
            ) : (
              <svg
                className="size-6 group-hover:scale-110 transition-transform duration-300"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                />
              </svg>
            )}
            <span className="text-lg">{isLoading ? "Đang xử lý..." : "Tiếp tục với Google"}</span>
          </button>

          {/* Footer Info */}
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-2 justify-center">
              <div className="h-px w-8 bg-slate-100" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-300">
                Bảo mật & Tin cậy
              </span>
              <div className="h-px w-8 bg-slate-100" />
            </div>
            <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto leading-relaxed">
              Bằng việc tiếp tục, bạn đồng ý với{" "}
              <a
                href="#"
                className="text-slate-500 hover:text-green-500 underline transition-colors"
              >
                Điều khoản
              </a>{" "}
              &{" "}
              <a
                href="#"
                className="text-slate-500 hover:text-green-500 underline transition-colors"
              >
                Chính sách
              </a>{" "}
              của VocabLab.
            </p>
          </div>

          {/* Bottom highlight bar */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-1.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-t-full opacity-30" />
        </div>

        {/* Helper footer */}
        <p className="mt-8 text-center text-sm font-medium text-slate-400">
          Cần hỗ trợ?{" "}
          <a href="mailto:support@vocablab.io" className="text-green-500 hover:underline">
            Liên hệ chúng tôi
          </a>
        </p>
      </div>
    </div>
  );
}
