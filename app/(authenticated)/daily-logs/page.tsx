"use client";
import { useState } from "react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useFetch } from "@/lib/useFetch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = useSession();
  const [date, setDate] = useState<Date>();
  const [selectedVolunteer, setSelectedVolunteer] = useState<vol>();
  const [open, setOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);

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

  const vols = useFetch<vol[]>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/volbyPoc/${session.data?.user.auth_id}`,
    {
      headers: {
        authorization: `Bearer ${session.data?.user.auth_token}`,
      },
      autoInvoke: true,
    },
    [session],
  );

  interface slotItem {
    id: number;
    hourStart: string;
    minStart: string;
    hourEnd: string;
    minEnd: string;
    activity: string;
    details: string;
  }

  interface logDay {
    id: number;
    vol_id: number;
    Date: string;
    isPocVerified: boolean;
    Logs: slotItem[];
  }

  const { data, loading, error, refetch, abort } = useFetch<logDay>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/attendence/get/${selectedVolunteer?.id}/${date ? date.getMonth() + 1 : ""}-${date?.getDate()}-${date?.getFullYear()}`,
    {
      headers: {
        authorization: `Bearer ${session.data?.user.auth_token}`,
      },
      autoInvoke: true,
    },
    [session, date],
  );

  const setVerified = async () => {
    try {
      if (data) {
        const resp = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/attendence/poc/${data.id}`,
          {
            headers: {
              authorization: `Bearer ${session.data?.user.auth_token}`,
            },
          },
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="container mx-auto my-6 px-4 sm:px-6 lg:px-8">
      <div className="overflow-x-auto px-1 pt-2">
        <div className="flex flex-col gap-3">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className="w-full">
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full font-light py-3 rounded-lg px-3  mb-2 flex justify-center items-center mr-2"
              >
                <div className="mx-2">
                  {selectedVolunteer && (
                    <div>{selectedVolunteer?.user_id?.name}</div>
                  )}
                  {!selectedVolunteer && <div>Select volunteer</div>}
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className=" w-full p-0">
              <Command>
                <CommandInput placeholder="Add Recipient" />
                <CommandList>
                  <CommandEmpty>No recipient found.</CommandEmpty>
                  <CommandGroup>
                    {vols.data && vols.data.constructor === Array && (
                      <div>
                        {vols.data.map((volDat) => (
                          <CommandItem
                            key={volDat.id}
                            value={volDat.user_id.name}
                            onSelect={(currentValue) => {
                              setSelectedVolunteer(volDat);
                              setOpen(false);
                            }}
                          >
                            {volDat.user_id.name}
                          </CommandItem>
                        ))}
                      </div>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <div className="flex flex-row gap-2">
            <Popover open={calOpen} onOpenChange={setCalOpen}>
              <PopoverTrigger asChild className="w-full">
                <Button
                  type="button"
                  variant={"outline"}
                  className={cn(
                    " w-full justify-center font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarDaysIcon className="mr-1 h-4 w-4 -translate-x-1" />
                  {date ? format(date, "PPP") : <span>Select a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className=" w-full p-0">
                <Calendar
                  initialFocus
                  mode="single"
                  selected={date}
                  onSelect={(e) => {
                    setDate(e);
                    setCalOpen(!calOpen);
                  }}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={refetch}>
              <RefreshIcon />
            </Button>
          </div>
          <div>
            <div className=" pb-2">
              {data?.Logs && data?.isPocVerified && (
                <Button
                  type="button"
                  className=" bg-blue-600 hover:bg-blue-600 text-gray-100 font-semibold rounded-md px-2 py-2
                             w-full text-center"
                >
                  Verified
                </Button>
              )}
              {data?.Logs && !data?.isPocVerified && (
                <Button
                  className=" bg-red-500 hover:bg-red-500 text-gray-100 font-semibold rounded-md px-2 py-2
                             w-full text-center"
                  onClick={setVerified}
                >
                  Not Verified
                </Button>
              )}
            </div>
            <div>
              {data?.Logs?.map((slot, index) => (
                <div key={index}>
                  <div className="flex text-pretty">
                    <div className=" text-lg font-semibold">
                      Slot #{index + 1}: {slot.activity} ({slot.hourStart}:
                      {slot.minStart} - {slot.hourEnd}:{slot.minEnd})
                    </div>
                  </div>
                  <div>{slot.details}</div>
                  <div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarDaysIcon(props: { className: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  );
}

const RefreshIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={24}
    height={24}
    color={"#000000"}
    fill={"none"}
    {...props}
  >
    <path
      d="M20.0092 2V5.13219C20.0092 5.42605 19.6418 5.55908 19.4537 5.33333C17.6226 3.2875 14.9617 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
