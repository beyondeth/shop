import { getProductById } from "@/app/wix-api/products";
import { getWixServerClient } from "@/lib/wix-client.server";

import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: { id: string };
  searchParams: any;
}

export default async function Page(props: PageProps) {
  try {
    // params와 searchParams await
    const { id } = await props.params;
    const searchParams = await props.searchParams;

    if (id === "someId") {
      redirect(
        `/products/i-m-a-product-1?${new URLSearchParams(searchParams)}`,
      );
    }

    // wixClient await
    const wixClient = await getWixServerClient();
    const product = await getProductById(wixClient, id);

    if (!product) notFound();

    redirect(`/products/${product.slug}?${new URLSearchParams(searchParams)}`);
  } catch (error) {
    console.error("Error in product redirect page:", error);
    notFound();
  }
}
