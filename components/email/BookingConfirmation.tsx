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

interface BookingConfirmationProps {
  userName: string;
  bookingId: string;
  date: string;
  startTime: string;
  duration: number;
  amount?: string;
  turf?: string;
  email?: string;
  phone?: string;
}

export const BookingConfirmation = ({
  userName,
  bookingId,
  date,
  startTime,
  duration,
  amount,
  turf,
  email,
  phone,
}: BookingConfirmationProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Booking is Confirmed 🎉</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>Booking Confirmed ✅</Heading>
          <Text>Dear {userName},</Text>
          <Text>
            Your booking (ID: <strong>{bookingId}</strong>) has been
            successfully confirmed.
          </Text>
          <Text>
            📅 Date: <strong>{date}</strong>⏰ Start Time:{" "}
            <strong>{startTime}</strong>⏳ Duration:{" "}
            <strong>{duration} hour(s)</strong>
          </Text>
          <Text>
            💰 Amount Paid: <strong>₹{amount}</strong>
          </Text>
          <Text>
            🏟️ Turf: <strong>{turf}</strong>
          </Text>
          <Text>
            📧 Email: <strong>{email}</strong>
          </Text>
          <Text>
            📞 Phone: <strong>{phone}</strong>
          </Text>
          <Text>
            If you have any questions or need to make changes to your booking,
            feel free to reach out to us.
          </Text>
          <Text>Enjoy your game! ⚽🏏</Text>
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

export default BookingConfirmation;

const styles = {
  body: { backgroundColor: "#f4f4f4", padding: "20px" },
  container: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
  },
  heading: { color: "#2e7d32" },
};
