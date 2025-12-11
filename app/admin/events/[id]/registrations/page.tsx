"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassTable } from "@/components/ui/glass-table";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ChevronLeft, Download, Eye } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";

interface Registration {
  id: string;
  userName: string;
  userEmail: string;
  teamName?: string;
  paymentStatus: string;
  customerPhone?: string;
  registeredAt: string;
  members: any; // JSON
}

const EventRegistrationsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchRegistrations = async () => {
      try {
        const res = await fetch(`/api/events/${id}/registrations`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setRegistrations(data);
      } catch (error) {
        toast.error("Failed to load registrations");
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [id]);

  const downloadCSV = () => {
    if (registrations.length === 0) {
      toast.error("No registrations to export");
      return;
    }

    const headers = [
      "User Name",
      "Email",
      "Team Name",
      "Payment Status",
      "Registered At",
    ];
    const rows = registrations.map((reg) => [
      reg.userName,
      reg.userEmail,
      reg.teamName || "N/A",
      reg.paymentStatus,
      reg.registeredAt
        ? format(new Date(reg.registeredAt), "yyyy-MM-dd HH:mm")
        : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `event_registrations_${id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      header: "Participant",
      accessor: (reg: Registration) => (
        <div>
          <div className="font-medium text-white">{reg.userName}</div>
          <div className="text-xs text-gray-400">{reg.userEmail}</div>
        </div>
      ),
    },
    {
      header: "Team",
      accessor: (reg: Registration) => (
        <span className="text-gray-300">{reg.teamName || "-"}</span>
      ),
    },
    {
      header: "Payment",
      accessor: (reg: Registration) => {
        const status = reg.paymentStatus;
        const className =
          status === "paid"
            ? "bg-green-500/20 text-green-400 border-green-500/50"
            : status === "pending"
              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
              : "bg-red-500/20 text-red-400 border-red-500/50";
        return (
          <Badge variant="outline" className={className}>
            {status?.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      header: "Registered At",
      accessor: (reg: Registration) => (
        <div className="text-sm text-gray-400">
          {reg.registeredAt
            ? format(new Date(reg.registeredAt), "MMM d, HH:mm")
            : "-"}
        </div>
      ),
    },
    {
      header: "Action",
      className: "text-right",
      accessor: (reg: Registration) => (
        <div className="flex justify-end">
          <NeonButton
            size="sm"
            variant="secondary"
            onClick={() => setSelectedReg(reg)}
          >
            <Eye className="w-4 h-4" />
          </NeonButton>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <NeonButton
            variant="ghost"
            onClick={() => router.back()}
            className="rounded-full p-2 h-10 w-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </NeonButton>
          <div>
            <h1 className="text-3xl font-bold text-white font-heading">
              Registrations
            </h1>
            <p className="text-gray-400">View and manage participants.</p>
          </div>
        </div>
        <NeonButton variant="ghost" onClick={downloadCSV}>
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </NeonButton>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            Loading registrations...
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No registrations found.
          </div>
        ) : (
          <GlassTable data={registrations} columns={columns} />
        )}
      </GlassCard>

      <Sheet
        open={!!selectedReg}
        onOpenChange={(open) => !open && setSelectedReg(null)}
      >
        <SheetContent
          side="right"
          className="bg-turf-dark border-l border-white/10 text-white z-[100] w-full max-w-md sm:max-w-lg overflow-y-auto"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-white">Registration Details</SheetTitle>
          </SheetHeader>
          {selectedReg && (
            <div className="space-y-6 pb-10">
              <div className="space-y-6">
                <div className="space-y-1">
                  <Label className="text-gray-400">Participant Name</Label>
                  <p className="text-xl font-bold font-heading">
                    {selectedReg.userName}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-1">
                    <Label className="text-gray-400">Email</Label>
                    <p className="text-white break-words">
                      {selectedReg.userEmail}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-400">Phone</Label>
                    <p className="text-white break-words">
                      {selectedReg.customerPhone || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-400">Registered At</Label>
                    <p className="text-white">
                      {selectedReg.registeredAt
                        ? format(
                            new Date(selectedReg.registeredAt),
                            "MMM d, yyyy p"
                          )
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-gray-400">Payment Status</Label>
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm font-bold uppercase ${
                        selectedReg.paymentStatus === "paid"
                          ? "bg-green-500/20 text-green-500"
                          : selectedReg.paymentStatus === "pending"
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      {selectedReg.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {selectedReg.teamName && (
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="space-y-1">
                    <Label className="text-turf-neon">Team Name</Label>
                    <p className="text-lg font-bold text-white">
                      {selectedReg.teamName}
                    </p>
                  </div>

                  {selectedReg.members && (
                    <div className="space-y-3">
                      <Label className="text-gray-400">Team Members</Label>
                      <div className="flex flex-col gap-2">
                        {Array.isArray(selectedReg.members) ? (
                          selectedReg.members.map((m: string, i: number) => (
                            <div
                              key={i}
                              className="bg-white/5 px-3 py-2 rounded text-sm text-gray-200 border border-white/5 flex items-center"
                            >
                              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs mr-3 text-gray-400">
                                {i + 1}
                              </span>
                              {m}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400 text-sm">
                            {JSON.stringify(selectedReg.members)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EventRegistrationsPage;
