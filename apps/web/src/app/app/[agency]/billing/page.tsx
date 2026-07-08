import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@clipsflow/db";
import { Icons } from "@/components/ui/icons";
import { UpgradeButton, ManageStripeButton, UpdatePaymentMethodButton } from "@/components/billing/billing-buttons";

export default async function AgencyBillingPage({ params }: { params: Promise<{ agency: string }> | { agency: string } }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    redirect("/api/auth/signin");
  }

  const agency = await prisma.agency.findUnique({
    where: { subdomain: resolvedParams.agency },
    include: { subscriptions: true }
  });

  if (!agency) return <div>Agency not found</div>;

  const currentPlan = agency.subscriptionTier || "Free";
  const hasActiveSubscription = agency.subscriptions.some(s => s.status === "active");

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Billing & Subscription</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage your agency's subscription plan and payment methods.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Icons.billing className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Current Plan: {currentPlan}
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                {hasActiveSubscription ? "Your subscription is currently active." : "You are currently on the Free plan."}
              </p>
            </div>
            {hasActiveSubscription ? (
              <span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Active
              </span>
            ) : (
              <span className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Free
              </span>
            )}
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Video Processing Minutes</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-white">450 / 1000 mins</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5">
              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>

          <div className="flex gap-4">
            <UpgradeButton agencyId={agency.id} />
            <ManageStripeButton agencyId={agency.id} />
          </div>
        </div>

        <div className="col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6 flex flex-col justify-center">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4">Payment Method</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-8 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
              <span className="text-xs font-bold text-zinc-500">CARD</span>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Managed in Stripe</p>
              <p className="text-xs text-zinc-500">Securely stored</p>
            </div>
          </div>
          <UpdatePaymentMethodButton agencyId={agency.id} />
        </div>
      </div>
    </div>
  );
}
