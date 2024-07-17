"use client";
import CohortListing from "@/components/partner/CohortListing";
export default function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div>
      <CohortListing />
    </div>
  );
}
