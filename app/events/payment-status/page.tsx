"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NeonButton } from "@/components/ui/neon-button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";

function EventPaymentStatusContent() {
  const searchParams = useSearchParams();
  const registrationId = searchParams.get("registrationId");
  const [status, setStatus] = useState<"loading" | "success" | "failure">(
    "loading"
  );

  useEffect(() => {
    if (!registrationId) {
      setStatus("failure");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/payment/events/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registrationId }),
        });
        const data = await res.json();
        if (data.status === "confirmed" || data.status === "paid") {
          setStatus("success");
        } else {
          setStatus("failure");
        }
      } catch (e) {
        setStatus("failure");
      }
    };

    verify();
  }, [registrationId]);

  return (
    <div className="min-h-screen bg-turf-dark flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full text-center py-12 px-6">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-turf-neon animate-spin" />
            <h2 className="text-xl font-bold text-white">
              Verifying Registration...
            </h2>
          </div>
        )}
        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <h2 className="text-2xl font-bold text-white">
              Registration Successful!
            </h2>
            <p className="text-gray-400">
              You are securely registered for the event.
            </p>
            <Link href="/events">
              <NeonButton className="mt-4">Back to Events</NeonButton>
            </Link>
          </div>
        )}
        {status === "failure" && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="w-16 h-16 text-red-500" />
            <h2 className="text-2xl font-bold text-white">
              Payment Failed or Pending
            </h2>
            <p className="text-gray-400">
              We couldn't verify your payment. Please try again or contact
              support.
            </p>
            <Link href="/events">
              <NeonButton variant="ghost" className="mt-4">
                Back to Events
              </NeonButton>
            </Link>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

export default function EventPaymentStatusPage() {
  return (
    <Suspense
      fallback={<div className="text-white text-center p-20">Loading...</div>}
    >
      <EventPaymentStatusContent />
    </Suspense>
  );
}
