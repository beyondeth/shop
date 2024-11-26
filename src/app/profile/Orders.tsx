"use client";

import LoadingButton from "@/components/LoadingButton";

import { Skeleton } from "@/components/ui/skeleton";
import { wixBrowserClient } from "@/lib/wix-client.browser";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserOrders } from "../wix-api/orders";
import Order from "@/components/Order";

export default function Orders() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["orders"],
      queryFn: async ({ pageParam }) =>
        getUserOrders(wixBrowserClient, {
          limit: 2,
          cursor: pageParam,
        }),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => lastPage.metadata?.cursors?.next,
    });

  const orders = data?.pages.flatMap((page) => page.orders) || [];

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">Your orders</h2>
      {status === "pending" && <OrdersLoadingSkeleton />}
      {status === "error" && (
        <p className="text-destructive">Error fetching orders</p>
      )}
      {status === "success" && !orders.length && !hasNextPage && (
        <p>No orders yet</p>
      )}
      {orders.map((order) => (
        <Order key={order.number} order={order} />
      ))}
      {hasNextPage && (
        <LoadingButton
          loading={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          Load more orders
        </LoadingButton>
      )}
    </div>
  );
}

function OrdersLoadingSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  );
}
