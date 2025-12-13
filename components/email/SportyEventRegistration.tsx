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
} from "@react-email/components";

interface SportyEventRegistrationProps {
  userName: string;
  eventName: string;
  eventDate: string;
  teamName?: string;
  amount?: string;
  registrationId: string;
}

export const SportyEventRegistration = ({
  userName = "Athlete",
  eventName = "Championship 2024",
  eventDate = "2024-12-30",
  teamName = "Thunderbolts",
  amount = "500",
  registrationId = "EVT-12345",
}: SportyEventRegistrationProps) => {
  return (
    <Html>
      <Head />
      <Preview>Registration Confirmed: {eventName} 🏆</Preview>
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
            <Heading style={heroText}>YOU'RE IN! 🎫</Heading>
            <Text style={subHeroText}>
              GET READY TO COMPETE, {userName.toUpperCase()}.
            </Text>
          </Section>

          {/* Event Card */}
          <Section style={ticketContainer}>
            <Section style={ticketHeader}>
              <Text style={ticketTitle}>EVENT PASS</Text>
            </Section>

            <Section style={ticketContent}>
              <Text style={eventNameText}>{eventName.toUpperCase()}</Text>
              <Text style={eventDateText}>{eventDate}</Text>

              <Hr style={divider} />

              <Row>
                <Column>
                  <Text style={label}>TEAM</Text>
                  <Text style={value}>{teamName || "Individual"}</Text>
                </Column>
                <Column style={{ textAlign: "right" }}>
                  <Text style={label}>ID</Text>
                  <Text style={value}>{registrationId}</Text>
                </Column>
              </Row>
            </Section>

            {/* Total */}
            <Section style={totalSection}>
              <Row>
                <Column>
                  <Text style={totalLabel}>ENTRY FEE</Text>
                </Column>
                <Column style={{ textAlign: "right" }}>
                  <Text style={totalValue}>
                    {Number(amount) > 0 ? `₹${amount}` : "FREE"}
                  </Text>
                </Column>
              </Row>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>Bring this email to the venue.</Text>
            <Text style={footerText}>© 2024 TurfBook Events.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default SportyEventRegistration;

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
  fontSize: "14px",
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
  marginTop: "20px",
};

const ticketHeader = {
  backgroundColor: "#1a1a1a",
  padding: "15px",
  borderBottom: "1px solid #333",
  textAlign: "center" as const,
};

const ticketTitle = {
  color: "#888",
  fontSize: "10px",
  fontWeight: "800",
  letterSpacing: "2px",
  margin: "0",
};

const ticketContent = {
  padding: "30px",
  textAlign: "center" as const,
};

const eventNameText = {
  color: "#fff",
  fontSize: "24px",
  fontWeight: "900",
  fontStyle: "italic",
  margin: "0 0 5px",
};

const eventDateText = {
  color: "#ccff00",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
};

const label = {
  color: "#666",
  fontSize: "10px",
  fontWeight: "800",
  letterSpacing: "1px",
  margin: "0 0 5px",
};

const value = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  margin: "0",
};

const divider = {
  borderColor: "#333",
  margin: "25px 0",
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
  fontSize: "20px",
  fontWeight: "900",
  fontStyle: "italic",
  margin: "0",
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
