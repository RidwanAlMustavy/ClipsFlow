"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-zinc-950 flex flex-col md:flex-row items-center justify-center p-6 transition-colors duration-300">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
        <div className="text-center md:text-left md:pr-10">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1877f2] dark:text-indigo-500 tracking-tight mb-4">
            ClipsFlow
          </h1>
          <p className="text-2xl md:text-3xl text-zinc-800 dark:text-zinc-300 font-normal leading-snug">
            Turn one video into a month of content. Connect with your clients instantly.
          </p>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-4 md:p-6 border border-transparent dark:border-zinc-800">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-200 dark:border-red-800/50">
                  {error}
                </div>
              )}
              
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#1877f2] dark:focus:ring-indigo-500 text-[17px] transition-colors"
                required
              />
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-12 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#1877f2] dark:focus:ring-indigo-500 text-[17px] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1877f2] dark:bg-indigo-600 hover:bg-[#166fe5] dark:hover:bg-indigo-700 text-white font-bold text-xl py-3 rounded-md transition-colors mt-2"
              >
                Log In
              </button>

              <div className="text-center mt-2">
                <a href="#" className="text-[#1877f2] dark:text-indigo-400 text-sm hover:underline font-medium">
                  Forgotten password?
                </a>
              </div>

              <hr className="my-4 border-zinc-300 dark:border-zinc-700" />

              <div className="text-center">
                <Link
                  href="/signup"
                  className="inline-block bg-[#42b72a] hover:bg-[#36a420] text-white font-bold text-[17px] px-6 py-3.5 rounded-md transition-colors"
                >
                  Create new account
                </Link>
              </div>
            </form>
          </div>
          <div className="text-center mt-6 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-bold cursor-pointer hover:underline">Create a Page</span> for a celebrity, brand or business.
          </div>
        </div>
      </div>
    </div>
  );
}
