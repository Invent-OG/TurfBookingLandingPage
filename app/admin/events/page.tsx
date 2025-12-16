"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassTable } from "@/components/ui/glass-table";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Plus, Users, Calendar, Trophy, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import {
  useEvents,
  useDeleteEvent,
  type Event as EventType,
} from "@/hooks/use-events";

const AdminEventsPage = () => {
  const { data: events = [], isLoading: loading } = useEvents();
  const deleteEventMutation = useDeleteEvent();
  const router = useRouter();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const columns = [
    {
      header: "Event",
      accessor: (event: EventType) => (
        <div>
          <div className="font-medium text-white">{event.title}</div>
          <div className="text-xs text-gray-400">{event.eventType}</div>
        </div>
      ),
    },
    {
      header: "Date",
      accessor: (event: EventType) => (
        <div className="text-sm text-gray-300">
          {format(new Date(event.startDate), "MMM d")} -{" "}
          {format(new Date(event.endDate), "MMM d, yyyy")}
        </div>
      ),
    },
    {
      header: "Participants",
      accessor: (event: EventType) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-turf-neon opacity-70" />
          <span className="text-white">
            {event.currentParticipants} / {event.maxParticipants}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (event: EventType) => {
        const status = event.status;
        let className = "";

        switch (status) {
          case "upcoming":
            className = "bg-blue-500/20 text-blue-400 border-blue-500/50";
            break;
          case "active":
            className = "bg-green-500/20 text-green-400 border-green-500/50";
            break;
          case "completed":
            className = "bg-gray-500/20 text-gray-400 border-gray-500/50";
            break;
          case "cancelled":
            className = "bg-red-500/20 text-red-400 border-red-500/50";
            break;
        }

        return (
          <Badge variant="outline" className={className}>
            {status.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      header: "Actions",
      accessor: (event: EventType) => (
        <div className="flex gap-2">
          {/* Manage Registrations */}
          <NeonButton
            variant="ghost"
            onClick={() =>
              router.push(`/admin/events/${event.id}/registrations`)
            }
          >
            Manage
          </NeonButton>

          {/* Edit Event */}
          <NeonButton
            variant="ghost"
            onClick={() => router.push(`/admin/events/edit/${event.id}`)}
          >
            Edit
          </NeonButton>

          {/* Delete Event */}
          <NeonButton
            variant="ghost"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={() => {
              setEventToDelete(event.id);
              setDeleteModalOpen(true);
            }}
          >
            Delete
          </NeonButton>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-heading">
            Event Management
          </h1>
          <p className="text-gray-400">
            Manage tournaments, leagues, and special events.
          </p>
        </div>
        <Link href="/admin/events/new">
          <NeonButton variant="primary" glow>
            <Plus className="w-4 h-4 mr-2" /> Create Event
          </NeonButton>
        </Link>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="p-4 rounded-full bg-white/5 mb-4">
              <Trophy className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              No Events Found
            </h3>
            <p className="text-gray-400 max-w-sm mb-6">
              You haven't created any events yet. Host a tournament or league to
              get started.
            </p>
            <Link href="/admin/events/new">
              <NeonButton variant="ghost">Create Your First Event</NeonButton>
            </Link>
          </div>
        ) : (
          <GlassTable data={events} columns={columns} />
        )}
      </GlassCard>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          if (!eventToDelete) return;
          setDeleting(true);
          try {
            await deleteEventMutation.mutateAsync(eventToDelete);
            toast.success("Event deleted successfully");
          } catch (e) {
            toast.error("Error deleting event");
          } finally {
            setDeleting(false);
            setDeleteModalOpen(false);
            setEventToDelete(null);
          }
        }}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
};

export default AdminEventsPage;
