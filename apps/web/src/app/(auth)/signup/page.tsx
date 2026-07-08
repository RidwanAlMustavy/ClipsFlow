"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    gender: "male",
    role: "AGENCY_ADMIN"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to sign up");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-zinc-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-[#1877f2] dark:text-indigo-500 tracking-tight">
          ClipsFlow
        </h1>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-4 md:p-6 border border-transparent dark:border-zinc-800 relative overflow-hidden">
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Create a new account</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">It's quick and easy.</p>
        </div>
        
        <hr className="my-4 border-zinc-200 dark:border-zinc-800" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-200 dark:border-red-800/50">
              {error}
            </div>
          )}
          
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="First name"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full px-3 py-2.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#1877f2] dark:focus:ring-indigo-500 transition-colors"
              required
            />
            <input
              type="text"
              placeholder="Last name"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full px-3 py-2.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#1877f2] dark:focus:ring-indigo-500 transition-colors"
              required
            />
          </div>
          
          <input
            type="email"
            placeholder="Email address (e.g. name@gmail.com)"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#1877f2] dark:focus:ring-indigo-500 transition-colors"
            required
          />

          <div className="flex">
            <select 
              className="px-3 py-2.5 rounded-l-md border border-r-0 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-[#1877f2] dark:focus:ring-indigo-500 transition-colors outline-none appearance-none"
              defaultValue="+1"
            >
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+91">🇮🇳 +91</option>
              <option value="+61">🇦🇺 +61</option>
              <option value="+880">🇧🇩 +880</option>
            </select>
            <input
              type="tel"
              placeholder="Mobile number (e.g. 01712345678)"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              pattern="^\d{11}$"
              title="Phone number must be exactly 11 digits"
              className="w-full px-3 py-2.5 rounded-r-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#1877f2] dark:focus:ring-indigo-500 transition-colors"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-3 py-2.5 pr-12 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#1877f2] dark:focus:ring-indigo-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 pl-1">Use at least 8 characters with a mix of letters and numbers.</p>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full px-3 py-2.5 pr-12 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#1877f2] dark:focus:ring-indigo-500 transition-colors"
              required
            />
          </div>

          <div className="mt-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block font-medium">Gender</span>
            <div className="flex gap-3">
              <label className="flex-1 flex items-center justify-between px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <span className="text-sm text-zinc-900 dark:text-zinc-100">Female</span>
                <input 
                  type="radio" 
                  name="gender" 
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="accent-[#1877f2] dark:accent-indigo-500"
                />
              </label>
              <label className="flex-1 flex items-center justify-between px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <span className="text-sm text-zinc-900 dark:text-zinc-100">Male</span>
                <input 
                  type="radio" 
                  name="gender" 
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="accent-[#1877f2] dark:accent-indigo-500"
                />
              </label>
              <label className="flex-1 flex items-center justify-between px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <span className="text-sm text-zinc-900 dark:text-zinc-100">Custom</span>
                <input 
                  type="radio" 
                  name="gender" 
                  value="custom"
                  checked={formData.gender === "custom"}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="accent-[#1877f2] dark:accent-indigo-500"
                />
              </label>
            </div>
          </div>

          <div className="mt-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block font-medium">Role</span>
            <div className="flex gap-3">
              <label className="flex-1 flex items-center justify-between px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <span className="text-sm text-zinc-900 dark:text-zinc-100">Agency</span>
                <input 
                  type="radio" 
                  name="role" 
                  value="AGENCY_ADMIN"
                  checked={formData.role === "AGENCY_ADMIN"}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="accent-[#1877f2] dark:accent-indigo-500"
                />
              </label>
              <label className="flex-1 flex items-center justify-between px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <span className="text-sm text-zinc-900 dark:text-zinc-100">Client</span>
                <input 
                  type="radio" 
                  name="role" 
                  value="CLIENT"
                  checked={formData.role === "CLIENT"}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="accent-[#1877f2] dark:accent-indigo-500"
                />
              </label>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 leading-tight">
            People who use our service may have uploaded your contact information to ClipsFlow.
            By clicking Sign Up, you agree to our Terms, Privacy Policy and Cookies Policy.
          </p>

          <div className="text-center mt-4 mb-2">
            <button
              type="submit"
              disabled={loading}
              className="w-[200px] bg-[#00a400] hover:bg-[#008f00] text-white font-bold text-lg py-1.5 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </div>
          
          <div className="text-center">
            <Link href="/login" className="text-[#1877f2] dark:text-indigo-400 text-sm hover:underline">
              Already have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
