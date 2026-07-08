"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@clipsflow/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10" as any,
});

export async function createCheckoutSession(agencyId: string, returnUrl: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }

  const agency = await prisma.agency.findUnique({
    where: { id: agencyId }
  });

  if (!agency) {
    throw new Error("Agency not found");
  }

  // Mock Stripe checkout if the user hasn't set their keys yet
  if (process.env.STRIPE_SECRET_KEY === "sk_test_..." || !process.env.STRIPE_SECRET_KEY) {
    // Simulate a successful checkout by upgrading the agency in the database directly
    await prisma.agency.update({
      where: { id: agencyId },
      data: { subscriptionTier: "Pro", stripeCustomerId: "cus_mocked_123" }
    });

    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: "sub_mocked_123" },
      update: { status: "active", plan: "Pro Plan" },
      create: {
        agencyId,
        stripeSubscriptionId: "sub_mocked_123",
        plan: "Pro Plan",
        status: "active",
      }
    });

    return { url: `${returnUrl}?session_id=mocked_success` };
  }

  // Create Stripe customer if doesn't exist
  let customerId = agency.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user?.email || "",
      name: agency.name,
      metadata: {
        agencyId: agency.id,
      }
    });
    customerId = customer.id;
    await prisma.agency.update({
      where: { id: agency.id },
      data: { stripeCustomerId: customerId }
    });
  }

  // Set up the checkout session
  // We'll use a hardcoded price for demo purposes (a typical $49/mo plan).
  // Ideally, this should come from your Stripe Dashboard Price ID.
  const stripeSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Pro Plan",
            description: "1000 Video Processing Minutes",
          },
          unit_amount: 4900,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: returnUrl,
    metadata: {
      agencyId: agency.id,
    }
  });

  return { url: stripeSession.url };
}

export async function createCustomerPortalSession(agencyId: string, returnUrl: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== "AGENCY_ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized");
  }

  const agency = await prisma.agency.findUnique({
    where: { id: agencyId }
  });

  if (!agency || !agency.stripeCustomerId) {
    throw new Error("Agency or customer not found");
  }

  // Prevent crashing if the user hasn't set their Stripe Keys yet
  if (process.env.STRIPE_SECRET_KEY === "sk_test_..." || !process.env.STRIPE_SECRET_KEY) {
    return { error: "You are in mocked billing mode. You need to configure real Stripe API keys to open the Customer Portal!" };
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: agency.stripeCustomerId,
    return_url: returnUrl,
  });

  return { url: portalSession.url };
}
