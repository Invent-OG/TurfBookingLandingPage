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

interface SportyBookingConfirmationProps {
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

export const SportyBookingConfirmation = ({
  userName = "Player 1",
  bookingId = "BK-123456",
  date = "2024-12-25",
  startTime = "06:00 PM",
  duration = 1,
  amount = "1200",
  turf = "Neon Arena",
  email = "player@example.com",
  phone = "9876543210",
}: SportyBookingConfirmationProps) => {
  return (
    <Html>
      <Head />
      <Preview>Detailed Match Info Inside ⚽</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={brand}>
              TURF<span style={{ color: "#ccff00" }}>BOOK</span>
            </Heading>
          </Section>

          {/* Hero Status */}
          <Section style={{ padding: "40px 0", textAlign: "center" }}>
            <Heading style={heroText}>BOOKING LOCKED 🔒</Heading>
            <Text style={subHeroText}>GAME ON, {userName.toUpperCase()}!</Text>
          </Section>

          {/* Ticket Card */}
          <Section style={ticketContainer}>
            {/* Ticket Header */}
            <Section style={ticketHeader}>
              <Text style={ticketTitle}>MATCH TICKET</Text>
              <Text style={bookingIdText}>ID: {bookingId}</Text>
            </Section>

            {/* Content Grid */}
            <Section style={ticketContent}>
              <Row>
                <Column>
                  <Text style={label}>DATE</Text>
                  <Text style={value}>{date}</Text>
                </Column>
                <Column style={{ textAlign: "right" }}>
                  <Text style={label}>TIME</Text>
                  <Text style={value}>{startTime}</Text>
                </Column>
              </Row>
              <Hr style={divider} />
              <Row>
                <Column>
                  <Text style={label}>ARENA</Text>
                  <Text style={value}>{turf.toUpperCase()}</Text>
                </Column>
                <Column style={{ textAlign: "right" }}>
                  <Text style={label}>DURATION</Text>
                  <Text style={value}>{duration} HR</Text>
                </Column>
              </Row>
            </Section>

            {/* Dashed Separator */}
            <Section style={dashedLineContainer}>
              <Hr style={dashedLine} />
            </Section>

            {/* Total */}
            <Section style={totalSection}>
              <Row>
                <Column>
                  <Text style={totalLabel}>TOTAL PAID</Text>
                </Column>
                <Column style={{ textAlign: "right" }}>
                  <Text style={totalValue}>₹{amount}</Text>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* Contact Info */}
          <Section style={{ marginTop: "30px", textAlign: "center" }}>
            <Text style={contactText}>
              Sent to <span style={{ color: "#fff" }}>{email}</span>
            </Text>
            <Text style={contactText}>Need Support? Reply to this email.</Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © 2024 TurfBook. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default SportyBookingConfirmation;

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
  color: "#ccff00",
  margin: "0",
  fontStyle: "italic",
  textShadow: "0 0 10px rgba(204, 255, 0, 0.3)",
};

const subHeroText = {
  fontSize: "16px",
  color: "#888888",
  fontWeight: "600",
  marginTop: "8px",
  letterSpacing: "1px",
};

const ticketContainer = {
  backgroundColor: "#111111",
  borderRadius: "16px",
  border: "1px solid #333",
  overflow: "hidden",
  boxShadow: "0 0 40px rgba(0,0,0,0.5)",
  marginTop: "20px",
};

const ticketHeader = {
  backgroundColor: "#1a1a1a",
  padding: "20px",
  borderBottom: "1px solid #333",
  textAlign: "center" as const,
};

const ticketTitle = {
  color: "#666",
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "4px",
  margin: "0",
};

const bookingIdText = {
  color: "#fff",
  fontSize: "14px",
  fontWeight: "600",
  marginTop: "5px",
  fontFamily: "monospace",
};

const ticketContent = {
  padding: "30px",
};

const label = {
  color: "#ccff00",
  fontSize: "10px",
  fontWeight: "800",
  letterSpacing: "1px",
  margin: "0 0 5px",
};

const value = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0",
};

const divider = {
  borderColor: "#333",
  margin: "20px 0",
};

const dashedLineContainer = {
  padding: "0 20px",
};

const dashedLine = {
  borderTop: "2px dashed #333",
  margin: "0",
};

const totalSection = {
  backgroundColor: "rgba(204, 255, 0, 0.05)",
  padding: "20px 30px",
};

const totalLabel = {
  color: "#888",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "1px",
  margin: "0",
};

const totalValue = {
  color: "#ccff00",
  fontSize: "24px",
  fontWeight: "900",
  fontStyle: "italic",
  margin: "0",
};

const contactText = {
  color: "#666",
  fontSize: "12px",
  margin: "5px 0",
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
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0",
};
