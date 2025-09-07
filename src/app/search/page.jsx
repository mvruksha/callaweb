import SearchPageContent from "@/components/searchpage/SearchPageContent";
import Titletag from "@/components/titletag/Titletag";
import { Suspense } from "react";

export default function SearchPage() {
  return (
    <>
      <Titletag
        url="/assets/titletag/banner1.jpg"
        parent=""
        title="Search Page"
      />
      <Suspense fallback={<p className="pt-4 px-4">Loading search...</p>}>
        <SearchPageContent />
      </Suspense>
    </>
  );
}
