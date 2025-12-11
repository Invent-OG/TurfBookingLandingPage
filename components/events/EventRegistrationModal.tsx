"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NeonButton } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users, User, Phone, Mail, CreditCard, Loader2 } from "lucide-react";

interface EventRegistrationModalProps {
  eventId: string;
  registrationType: "individual" | "team";
  price: number;
}

export const EventRegistrationModal = ({
  eventId,
  registrationType,
  price,
}: EventRegistrationModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    teamName: "",
    members: [] as string[],
  });

  const [tempMember, setTempMember] = useState("");

  const handleAddMember = () => {
    if (tempMember.trim()) {
      setFormData({ ...formData, members: [...formData.members, tempMember] });
      setTempMember("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Register User & Event
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: null, // Assuming guest checkout for now, or pass actual user ID if available
          teamName: registrationType === "team" ? formData.teamName : null,
          members: registrationType === "team" ? formData.members : null,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // 2. Handle Payment if Price > 0
      if (price > 0 && data.registration?.id) {
        toast.info("Initiating Payment...");

        const paymentRes = await fetch("/api/payment/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: data.registration.id,
            order_amount: price,
            customer_name: formData.customerName || "Guest",
            customer_email: formData.customerEmail || "guest@example.com",
            customer_phone: formData.customerPhone || "9999999999", // Cashfree requires a phone number
          }),
        });

        const paymentData = await paymentRes.json();
        if (!paymentData.paymentSessionId)
          throw new Error("Payment initialization failed");

        const { load } = await import("@cashfreepayments/cashfree-js");
        const cashfree = await load({ mode: "sandbox" }); // or production

        await cashfree.checkout({
          paymentSessionId: paymentData.paymentSessionId,
          redirectTarget: "_self",
        });

        return; // Redirecting...
      }

      toast.success("Successfully registered!");
      setOpen(false);
      // Optional: Refresh parent or redirect
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <NeonButton
          variant="primary"
          size="lg"
          glow
          className="w-full md:w-auto px-8"
        >
          Register Now
        </NeonButton>
      </DialogTrigger>
      <DialogContent className="bg-turf-dark border border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-heading">
            Event Registration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Your Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  className="bg-white/5 border-white/10 pl-9"
                  placeholder="John Doe"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  className="bg-white/5 border-white/10 pl-9"
                  placeholder="john@example.com"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, customerEmail: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="tel"
                  className="bg-white/5 border-white/10 pl-9"
                  placeholder="+91 98765 43210"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                />
              </div>
            </div>

            {registrationType === "team" && (
              <>
                <div className="space-y-2">
                  <Label>Team Name</Label>
                  <Input
                    className="bg-white/5 border-white/10"
                    placeholder="The Avengers"
                    value={formData.teamName}
                    onChange={(e) =>
                      setFormData({ ...formData, teamName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Team Members (Names)</Label>
                  <div className="flex gap-2">
                    <Input
                      className="bg-white/5 border-white/10"
                      placeholder="Add Member Name"
                      value={tempMember}
                      onChange={(e) => setTempMember(e.target.value)}
                    />
                    <NeonButton variant="ghost" onClick={handleAddMember}>
                      Add
                    </NeonButton>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.members.map((m, i) => (
                      <span
                        key={i}
                        className="bg-white/10 px-2 py-1 rounded text-sm text-gray-300"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Total Amount:</span>
              <span className="text-2xl font-bold text-turf-neon">
                ₹{price}
              </span>
            </div>

            <NeonButton
              variant="primary"
              className="w-full"
              glow
              onClick={(e) => handleSubmit(e)}
              disabled={
                loading || !formData.customerName || !formData.customerEmail
              }
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              Proceed to Payment
            </NeonButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
