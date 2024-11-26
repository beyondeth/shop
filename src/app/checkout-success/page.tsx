import { getWixServerClient } from "@/lib/wix-client.server";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ClearCart from "./ClearCart";
import { getOrder } from "../wix-api/orders";
import { getLoggedInMember } from "../wix-api/members";
import Order from "@/components/Order";

interface PageProps {
  searchParams: Promise<{ orderId: string }>;
}

export const metadata: Metadata = {
  title: "Checkout success",
};

export default async function Page(props: PageProps) {
  try {
    const { orderId } = await props.searchParams;
    const wixClient = await getWixServerClient();

    const [order, loggedInMember] = await Promise.all([
      getOrder(wixClient, orderId),
      getLoggedInMember(wixClient),
    ]);

    if (!order) {
      notFound();
    }

    const orderCreatedDate = order._createdDate
      ? new Date(order._createdDate)
      : null;

    return (
      <main className="mx-auto flex max-w-3xl flex-col items-center space-y-5 px-5 py-10">
        <h1 className="text-3xl font-bold">We received your order!</h1>
        <p>A summary of your order was sent to your email address.</p>
        <h2 className="text-2xl font-bold">Order details</h2>
        <Order order={order} />
        {loggedInMember && (
          <Link href="/profile" className="block text-primary hover:underline">
            View all your orders
          </Link>
        )}
        {orderCreatedDate &&
          orderCreatedDate.getTime() > Date.now() - 60_000 * 5 && <ClearCart />}
      </main>
    );
  } catch (error) {
    console.error("Error loading checkout success page:", error);
    return (
      <main className="mx-auto flex max-w-3xl flex-col items-center space-y-5 px-5 py-10">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p>We load your order details. Please try again later.</p>
        <Link href="/" className="text-primary hover:underline">
          Return to home
        </Link>
      </main>
    );
  }
}
