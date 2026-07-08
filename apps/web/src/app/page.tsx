import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@clipsflow/db";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    const role = (session.user as any).role;
    
    if (role === "SUPER_ADMIN") {
      redirect("/superadmin");
    } else if (role === "AGENCY_ADMIN") {
      const agencyId = (session.user as any).agencyId;
      if (agencyId) {
        const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
        if (agency) {
          redirect(`http://${agency.subdomain}.localhost:3000/admin`);
        }
      }
    } else if (role === "CLIENT") {
      // Just an example fallback if they have no agency setup
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col transition-colors duration-300">
      <header className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold tracking-tighter text-zinc-900 dark:text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          ClipsFlow
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {session ? (
            <Link 
              href="/api/auth/signout" 
              className="text-sm font-medium bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              Sign Out
            </Link>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto mt-12 mb-24">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-sm font-semibold tracking-wide uppercase">
          B2B Content Repurposing
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-8 leading-tight">
          Turn one video into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">month of content.</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-12">
          The ultimate multi-tenant SaaS platform for marketing agencies to upload, generate, and deliver short-form clips to their clients.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            href="/api/auth/signin" 
            className="w-full sm:w-auto text-base font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Access Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
