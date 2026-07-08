"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createCheckoutSession, createCustomerPortalSession } from "@/app/actions/billing";

interface Props {
  agencyId: string;
}

export function UpgradeButton({ agencyId }: Props) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const returnUrl = window.location.href;
      const res = await createCheckoutSession(agencyId, returnUrl);
      
      if ('error' in res) {
        alert(res.error);
        return;
      }
      
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong initializing the checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleUpgrade}
      disabled={loading}
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm transition-colors flex items-center justify-center min-w-[140px]"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Upgrade Plan"}
    </button>
  );
}

export function ManageStripeButton({ agencyId }: Props) {
  const [loading, setLoading] = useState(false);

  const handleManage = async () => {
    try {
      setLoading(true);
      const returnUrl = window.location.href;
      const res = await createCustomerPortalSession(agencyId, returnUrl);
      
      if ('error' in res) {
        alert(res.error);
        return;
      }

      if (res.url) {
        window.location.href = res.url;
      }
    } catch (error) {
      console.error(error);
      alert("Could not open Stripe Portal. Make sure you have checked out at least once.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleManage}
      disabled={loading}
      className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center min-w-[160px]"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Manage in Stripe"}
    </button>
  );
}

export function UpdatePaymentMethodButton({ agencyId }: Props) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const returnUrl = window.location.href;
      const res = await createCustomerPortalSession(agencyId, returnUrl);
      
      if ('error' in res) {
        alert(res.error);
        return;
      }

      if (res.url) {
        window.location.href = res.url;
      }
    } catch (error) {
      console.error(error);
      alert("Could not open Stripe Portal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleUpdate}
      disabled={loading}
      className="text-sm text-indigo-600 dark:text-indigo-400 font-medium text-left hover:underline flex items-center gap-2"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update payment method"}
    </button>
  );
}
