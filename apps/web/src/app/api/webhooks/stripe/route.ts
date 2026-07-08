import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@clipsflow/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return new NextResponse("No signature", { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === "checkout.session.completed") {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      
      if (session.metadata?.agencyId) {
        await prisma.subscription.create({
          data: {
            agencyId: session.metadata.agencyId,
            stripeSubscriptionId: subscription.id,
            plan: "Pro Plan", // Based on the price we created
            status: subscription.status,
          }
        });
        
        await prisma.agency.update({
          where: { id: session.metadata.agencyId },
          data: { subscriptionTier: "Pro" }
        });
      }
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      
      const existingSub = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id }
      });
      
      if (existingSub) {
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: subscription.status }
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      
      const existingSub = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id }
      });
      
      if (existingSub) {
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: subscription.status }
        });
        
        // Downgrade agency
        await prisma.agency.update({
          where: { id: existingSub.agencyId },
          data: { subscriptionTier: "Free" }
        });
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Stripe Webhook Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
