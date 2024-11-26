import Product from "@/components/Product";
import { Skeleton } from "@/components/ui/skeleton";
import { getWixServerClient } from "@/lib/wix-client.server";
import { products } from "@wix/stores";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ProductDetails from "./ProductDetails";
import ProductReviews, {
  ProductReviewsLoadingSkeleton,
} from "./ProductReviews";
import { getProductBySlug, getRelatedProducts } from "@/app/wix-api/products";
import { getLoggedInMember } from "@/app/wix-api/members";
import { getProductReviews } from "@/app/wix-api/reviews";
import CreateProductReviewButton from "@/components/reviews/CreateProductReviewButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    // URL 디코딩 추가
    const decodedSlug = decodeURIComponent(slug);

    const wixClient = await getWixServerClient();
    const product = await getProductBySlug(wixClient, decodedSlug);

    if (!product) notFound();

    const mainImage = product.media?.mainMedia?.image;

    return {
      title: product.name,
      description: "Get this product on Flow Shop",
      openGraph: {
        images: mainImage?.url
          ? [
              {
                url: mainImage.url,
                width: mainImage.width,
                height: mainImage.height,
                alt: mainImage.altText || "",
              },
            ]
          : undefined,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Product",
      description: "Product details",
    };
  }
}

export default async function Page(props: PageProps) {
  try {
    const { slug } = await props.params;
    // URL 디코딩 추가
    const decodedSlug = decodeURIComponent(slug);

    const wixClient = await getWixServerClient();
    const product = await getProductBySlug(wixClient, decodedSlug);

    if (!product?._id) notFound();

    return (
      <main className="mx-auto max-w-7xl space-y-10 px-5 py-10">
        <ProductDetails product={product} />
        <hr />
        <Suspense fallback={<RelatedProductsLoadingSkeleton />}>
          <RelatedProducts productId={product._id} />
        </Suspense>
        <hr />
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">Buyer reviews</h2>
          <Suspense fallback={<ProductReviewsLoadingSkeleton />}>
            <ProductReviewsSection product={product} />
          </Suspense>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error loading product page:", error);
    notFound();
  }
}

interface RelatedProductsProps {
  productId: string;
}

async function RelatedProducts({ productId }: RelatedProductsProps) {
  try {
    const wixClient = await getWixServerClient();
    const relatedProducts = await getRelatedProducts(wixClient, productId);

    if (!relatedProducts.length) return null;

    return (
      <div className="space-y-5">
        <h2 className="text-2xl font-bold">Related Products</h2>
        <div className="flex grid-cols-2 flex-col gap-5 sm:grid lg:grid-cols-4">
          {relatedProducts.map((product) => (
            <Product key={product._id} product={product} />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading related products:", error);
    return null;
  }
}

function RelatedProductsLoadingSkeleton() {
  return (
    <div className="flex grid-cols-2 flex-col gap-5 pt-12 sm:grid lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[26rem] w-full" />
      ))}
    </div>
  );
}

interface ProductReviewsSectionProps {
  product: products.Product;
}

async function ProductReviewsSection({ product }: ProductReviewsSectionProps) {
  try {
    if (!product._id) return null;

    const wixClient = await getWixServerClient();
    const loggedInMember = await getLoggedInMember(wixClient);

    const existingReview = loggedInMember?.contactId
      ? (
          await getProductReviews(wixClient, {
            productId: product._id,
            contactId: loggedInMember.contactId,
          })
        ).items[0]
      : null;

    return (
      <div className="space-y-5">
        <CreateProductReviewButton
          product={product}
          loggedInMember={loggedInMember}
          hasExistingReview={!!existingReview}
        />
        <ProductReviews product={product} />
      </div>
    );
  } catch (error) {
    console.error("Error loading product reviews section:", error);
    return (
      <div className="py-5 text-center">
        <p className="text-muted-foreground">
          Unable to load reviews at this time
        </p>
      </div>
    );
  }
}
