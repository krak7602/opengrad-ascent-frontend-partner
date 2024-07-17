"use client";
import { useSession } from "next-auth/react";
import { useFetch } from "@/lib/useFetch";
import { AddVolunteer } from "@/components/partner/AddVolunteer";
import { VolunteerTable } from "@/components/partner/VolunteerTable";
import { columns } from "@/components/partner/VolunteerColumn";
export default function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = useSession();

  interface user_id {
    id: number;
    name: string;
    email: string;
    role: string;
  }

  interface poc {
    id: number;
  }

  interface vol {
    id: number;
    poc: poc;
    user_id: user_id;
  }

  const { data, loading, error, refetch, abort } = useFetch<vol[]>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/volbyPoc/${session.data?.user.auth_id}`,
    {
      headers: {
        authorization: `Bearer ${session.data?.user.auth_token}`,
      },
      autoInvoke: true,
    },
    [session],
  );
  return (
    <div className="container mx-auto my-6 px-2 lg:px-8">
      <div className="flex flex-col lg:flex-row items-start justify-between mb-2 py-4 rounded bg-primary text-white px-4">
        <div className=" pb-1">
          <h1 className="text-2xl font-bold">Volunteers</h1>
        </div>
        <div className="flex w-full flex-row justify-end">
          <div className=" text-black">
            <AddVolunteer />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        {data && data.constructor === Array && (
          <div>
            <VolunteerTable columns={columns} data={data} />
          </div>
        )}
      </div>
    </div>
  );
}
