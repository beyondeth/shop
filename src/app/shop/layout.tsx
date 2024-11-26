import { getWixServerClient } from "@/lib/wix-client.server";
import SearchFilterLayout from "./SearchFilterLayout";
import { getCollections } from "../wix-api/collection";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // getWixServerClient에 await 추가
    const wixClient = await getWixServerClient();
    const collections = await getCollections(wixClient);

    return (
      <SearchFilterLayout collections={collections}>
        {children}
      </SearchFilterLayout>
    );
  } catch (error) {
    console.error("Error loading search filter layout:", error);

    // 에러 발생 시에도 children은 렌더링
    return <SearchFilterLayout collections={[]}>{children}</SearchFilterLayout>;
  }
}
