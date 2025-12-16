import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Row,
  Column,
  Hr,
  Button,
  Img,
} from "@react-email/components";

interface SportyBookingCancellationProps {
  userName: string;
  bookingId: string;
  turf: string;
  date: string;
  companyName?: string;
  supportPhone?: string;
  logoUrl?: string;
}

export const SportyBookingCancellation = ({
  userName = "Player 1",
  bookingId = "BK-123456",
  turf = "Neon Arena",
  date = "2024-12-25",
  companyName = "KRP Sports Zone",
  supportPhone = "+91 88838 88025",
  logoUrl = "https://krpsportszone.com/logo.png",
}: SportyBookingCancellationProps) => {
  return (
    <Html>
      <Head />
      <Preview>Booking Cancelled ❌</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={logoUrl}
              width="60"
              height="60"
              alt={companyName}
              style={{ margin: "0 auto 10px", borderRadius: "8px" }}
            />
            <Heading style={brand}>{companyName}</Heading>
          </Section>

          {/* Hero Status */}
          <Section style={{ padding: "40px 0", textAlign: "center" }}>
            <Heading style={heroText}>MATCH CANCELLED ❌</Heading>
            <Text style={subHeroText}>
              BOOKING {bookingId} HAS BEEN CANCELLED.
            </Text>
          </Section>

          {/* Details Card */}
          <Section style={cardContainer}>
            <Text style={messageText}>
              Hi {userName}, as per your request (or admin action), your booking
              at <strong>{turf}</strong> on {date} has been cancelled.
            </Text>

            <Section style={{ textAlign: "center", marginTop: "30px" }}>
              <Button style={button} href="https://krpsportszone.com">
                BOOK A NEW SLOT
              </Button>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Need Support? Call {supportPhone} or reply to this email.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} {companyName}.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default SportyBookingCancellation;

const main = {
  backgroundColor: "#000000",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "580px",
};

const header = {
  textAlign: "center" as const,
  paddingBottom: "20px",
  borderBottom: "1px solid #333",
};

const brand = {
  fontSize: "24px",
  fontWeight: "900",
  color: "#ffffff",
  fontStyle: "italic",
  margin: "0",
  letterSpacing: "-1px",
};

const heroText = {
  fontSize: "32px",
  fontWeight: "900",
  color: "#666666",
  margin: "0",
  fontStyle: "italic",
  textDecoration: "line-through",
  textDecorationColor: "#ff0033",
};

const subHeroText = {
  fontSize: "14px",
  color: "#888888",
  fontWeight: "600",
  marginTop: "8px",
  letterSpacing: "1px",
};

const cardContainer = {
  backgroundColor: "#111111",
  borderRadius: "16px",
  border: "1px solid #333",
  padding: "30px",
  marginTop: "20px",
};

const messageText = {
  color: "#ccc",
  fontSize: "14px",
  textAlign: "center" as const,
  lineHeight: "1.6",
  margin: "0",
};

const button = {
  backgroundColor: "#333",
  color: "#fff",
  padding: "12px 30px",
  borderRadius: "0",
  fontWeight: "900",
  fontSize: "14px",
  textDecoration: "none",
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
  transform: "skew(-10deg)",
};

const footer = {
  marginTop: "40px",
  borderTop: "1px solid #333",
  paddingTop: "20px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#444",
  fontSize: "10px",
  margin: "5px 0",
};
