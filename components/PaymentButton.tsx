"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

const PaymentButton = () => {
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !window.Cashfree) {
      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.onload = () => {
        console.log("✅ Cashfree SDK Loaded");
        setCashfreeLoaded(true);
      };
      script.onerror = () => {
        console.error("❌ Cashfree SDK Failed to Load");
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  const handlePayment = async () => {
    if (!cashfreeLoaded || typeof window.Cashfree === "undefined") {
      console.error("❌ Cashfree SDK is not loaded!");
      return;
    }

    try {
      console.log("🔄 Fetching Payment Session...");
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("❌ Failed to fetch payment session");

      const data = await response.json();
      console.log("✅ Payment Session Data:", data);

      if (!data.paymentSessionId)
        throw new Error("❌ Invalid payment session ID");

      const cf = new window.Cashfree({ mode: "sandbox" });

      cf.checkout({
        paymentSessionId: data.paymentSessionId,
        onSuccess: (paymentData: any) => {
          console.log("✅ Payment Successful:", paymentData);
          router.replace("/checkout");
        },
        onFailure: (error: any) => {
          console.error("❌ Payment Failed:", error);
          router.replace("/");
        },
      });
    } catch (error) {
      console.error("❌ Payment Error:", error);
    }
  };

  return <Button onClick={handlePayment}>Pay Now</Button>;
};

export default PaymentButton;
