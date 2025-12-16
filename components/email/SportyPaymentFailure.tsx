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

interface SportyPaymentFailureProps {
  userName: string;
  bookingId: string;
  amount: string;
  turf: string;
  companyName?: string;
  supportPhone?: string;
}

export const SportyPaymentFailure = ({
  userName = "Player 1",
  bookingId = "BK-FAILED",
  amount = "0",
  turf = "Arena",
  companyName = "KRP Sports Zone",
  supportPhone = "+91 88838 88025",
}: SportyPaymentFailureProps) => {
  return (
    <Html>
      <Head />
      <Preview>Action Required: Payment Failed 🛑</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://krpsportszone.com/logo.png"
              width="60"
              height="60"
              alt="KRP Sports Zone"
              style={{ margin: "0 auto 10px", borderRadius: "8px" }}
            />
            <Heading style={brand}>{companyName}</Heading>
          </Section>

          {/* Hero Status */}
          <Section style={{ padding: "40px 0", textAlign: "center" }}>
            <Heading style={heroText}>PAYMENT FAILED 🛑</Heading>
            <Text style={subHeroText}>
              THE GAME IS ON PAUSE, {userName.toUpperCase()}.
            </Text>
          </Section>

          {/* Failure Card */}
          <Section style={cardContainer}>
            <Text style={messageText}>
              We couldn't process your payment for the booking at{" "}
              <strong>{turf}</strong>.
            </Text>

            <Section style={detailsContainer}>
              <Row>
                <Column>
                  <Text style={label}>BOOKING ID</Text>
                  <Text style={value}>{bookingId}</Text>
                </Column>
                <Column style={{ textAlign: "right" }}>
                  <Text style={label}>AMOUNT</Text>
                  <Text style={value}>₹{amount}</Text>
                </Column>
              </Row>
            </Section>

            <Section style={{ textAlign: "center", marginTop: "30px" }}>
              <Button style={button} href="https://krpsportszone.com/bookings">
                RETRY PAYMENT
              </Button>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Need help? Call {supportPhone} or reply to this email.
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

export default SportyPaymentFailure;

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
  color: "#ff0033",
  margin: "0",
  fontStyle: "italic",
  textShadow: "0 0 10px rgba(255, 0, 51, 0.3)",
};

const subHeroText = {
  fontSize: "16px",
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
  lineHeight: "1.5",
  marginBottom: "20px",
};

const detailsContainer = {
  backgroundColor: "#1a1a1a",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #333",
};

const label = {
  color: "#ff0033",
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
  fontFamily: "monospace",
};

const button = {
  backgroundColor: "#ff0033",
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
  marginTop: "5px",
};
