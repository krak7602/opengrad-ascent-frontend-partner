import { CohortTable } from "@/components/partner/CohortTable";
import { columns } from "@/components/partner/CohortColumn";
import { useFetch } from "@/lib/useFetch";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Error from "../Error";
import Loading from "../Loading";
import Refetching from "../Refetching";

export default function CohortListing() {
  const session = useSession();
  interface poc {
    id: number;
  }

  interface cohortColumn {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    poc: poc[];
  }

  const { data, isError, isLoading, isSuccess, isRefetching } = useQuery<
    cohortColumn[]
  >({
    queryKey: ["cohort"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/cohort/poc/${session.data?.user.auth_id}`,
        {
          headers: {
            authorization: `Bearer ${session.data?.user.auth_token}`,
          },
        },
      );
      return res.json();
    },
    refetchOnMount: true,
    enabled: !!session.data?.user.auth_token,
  });

  // const { data, loading, error, refetch, abort } = useFetch<cohortColumn[]>(
  //   `${process.env.NEXT_PUBLIC_API_BASE_URL}/cohort/poc/${session.data?.user.auth_id}`,
  //   {
  //     headers: {
  //       authorization: `Bearer ${session.data?.user.auth_token}`,
  //     },
  //     autoInvoke: true,
  //   },
  //   [session],
  // );

  return (
    <div>
      {isError && <Error />}
      {!isError && isLoading && <Loading />}
      {!isError && !isLoading && data && (
        <div className="container mx-auto my-6 px-2 lg:px-8">
          {isRefetching && <Refetching />}
          <div className="flex flex-col lg:flex-row items-start justify-between mb-2 pt-4 pb-6 rounded bg-primary text-white px-4">
            <div className=" pb-1">
              <h1 className="text-2xl font-bold">Cohorts</h1>
            </div>
          </div>
          <div className="overflow-x-auto">
            {/* {loading && (
              <div>
                <div className="flex flex-col space-y-3">
                  <Skeleton className=" h-11 w-full rounded-md" />
                </div>
              </div>
            )} */}
            {data && (
              <div>
                <CohortTable columns={columns} data={data} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
