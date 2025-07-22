import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
} from "@react-email/components";

interface PaymentFailureProps {
  userName: string;
  bookingId: string;
}

export const PaymentFailure = ({
  userName,
  bookingId,
}: PaymentFailureProps) => {
  return (
    <Html>
      <Head />
      <Preview>Payment Failed - Booking Not Confirmed ❌</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>Payment Failed ❌</Heading>
          <Text>Dear {userName},</Text>
          <Text>
            Unfortunately, your payment for Booking ID{" "}
            <strong>{bookingId}</strong> was unsuccessful.
          </Text>
          <Text>
            If the amount was deducted, please check with your bank. You can try
            booking again on our platform.
          </Text>
          <Text>
            Best regards,
            <br />
            Turf Booking Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentFailure;

const styles = {
  body: { backgroundColor: "#f4f4f4", padding: "20px" },
  container: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
  },
  heading: { color: "#d32f2f" },
};
