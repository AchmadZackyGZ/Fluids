import React, { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface AuthFormCardProps {
  onRegisterSuccess?: (userData: {
    fullName: string;
    username: string;
    email: string;
  }) => void;
  onLoginSuccess?: (userData: {
    fullName: string;
    username: string;
    email: string;
  }) => void;
}

export const AuthFormCard: React.FC<AuthFormCardProps> = ({
  onRegisterSuccess,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form States for Sign In
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Form States for Register
  const [regFullName, setRegFullName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sign in failed");
      }

      if (data.data?.token) {
        localStorage.setItem("fluids_token", data.data.token);
      }

      const userData = data.data?.user || {
        fullName: "Achmad Zacky",
        username: loginEmail.split("@")[0] || "achmadzacky",
        email: loginEmail,
      };

      setSuccessMessage(
        "Sign in successful! Redirecting to Dashboard Home....",
      );

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess({
            fullName: userData.full_name || userData.fullName || "Achmad Zacky",
            username: userData.username || loginEmail.split("@")[0],
            email: userData.email || loginEmail,
          });
        }
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || "Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: regFullName,
          username: regUsername,
          email: regEmail,
          password: regPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (data.data?.token) {
        localStorage.setItem("fluids_token", data.data.token);
      }

      setSuccessMessage(
        "Account created successfully! Launching your workspace...",
      );

      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess({
            fullName: regFullName,
            username: regUsername,
            email: regEmail,
          });
        }
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || "Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8">
      {/* Tab Switcher */}
      <div className="flex border-b border-border-default mb-8 relative">
        <button
          onClick={() => {
            setActiveTab("signin");
            setErrorMessage(null);
          }}
          className={`flex-1 pb-3 text-sm font-semibold transition-colors relative font-mono cursor-pointer ${
            activeTab === "signin"
              ? "text-text-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Sign In
          {activeTab === "signin" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent rounded-t-xs" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("register");
            setErrorMessage(null);
          }}
          className={`flex-1 pb-3 text-sm font-semibold transition-colors relative font-mono cursor-pointer ${
            activeTab === "register"
              ? "text-text-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Register
          {activeTab === "register" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent rounded-t-xs" />
          )}
        </button>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="mb-5 p-3 rounded-sm bg-diff-remove/10 border border-diff-remove/30 flex items-center gap-2.5 text-diff-remove text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 p-3 rounded-sm bg-diff-add/10 border border-diff-add/30 flex items-center gap-2.5 text-diff-add text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* SIGN IN FORM */}
      {activeTab === "signin" && (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-text-secondary font-mono mb-1">
              Email atau Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="nama@email.com atau username"
                className="w-full bg-surface-raised border border-border-default rounded-sm py-2 pl-8 pr-3 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-text-secondary font-mono mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-raised border border-border-default rounded-sm py-2 pl-8 pr-9 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-text-secondary pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 rounded-xs accent-accent cursor-pointer"
              />
              <span>Ingat Saya</span>
            </label>
            <a
              href="#forgot"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Lupa Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-accent hover:bg-accent-hover text-canvas rounded-sm flex items-center justify-center gap-2 text-xs font-semibold tracking-wide transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span>Mengotentikasi...</span>
            ) : (
              <>
                <span>Masuk ke FLUIDS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* REGISTER FORM */}
      {activeTab === "register" && (
        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-medium text-text-secondary font-mono mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="Achmad Zacky"
                className="w-full bg-surface-raised border border-border-default rounded-sm py-2 pl-8 pr-3 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-text-secondary font-mono mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="achmadzacky"
                className="w-full bg-surface-raised border border-border-default rounded-sm py-2 pl-8 pr-3 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-text-secondary font-mono mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="zacky@fluids.com"
                className="w-full bg-surface-raised border border-border-default rounded-sm py-2 pl-8 pr-3 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-text-secondary font-mono mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-raised border border-border-default rounded-sm py-2 pl-8 pr-9 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-accent hover:bg-accent-hover text-canvas rounded-sm flex items-center justify-center gap-2 text-xs font-semibold tracking-wide transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span>Mendaftarkan Akun...</span>
            ) : (
              <>
                <span>Buat Akun Developer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Social Auth Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-default"></div>
        </div>
        <span className="relative bg-surface px-3 text-[11px] text-text-secondary uppercase tracking-wider font-mono">
          Atau lanjutkan dengan
        </span>
      </div>

      {/* Social Auth Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            if (onRegisterSuccess) {
              onRegisterSuccess({
                fullName: "Google Explorer",
                username: "google_user",
                email: "user@google.com",
              });
            }
          }}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-sm bg-surface-raised border border-border-default hover:border-border-strong text-xs font-mono text-text-primary transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onRegisterSuccess) {
              onRegisterSuccess({
                fullName: "GitHub Developer",
                username: "github_dev",
                email: "dev@github.com",
              });
            }
          }}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-sm bg-surface-raised border border-border-default hover:border-border-strong text-xs font-mono text-text-primary transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span>GitHub</span>
        </button>
      </div>
    </div>
  );
};
