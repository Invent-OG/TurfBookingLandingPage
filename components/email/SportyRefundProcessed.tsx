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
  Img,
} from "@react-email/components";

interface SportyRefundProcessedProps {
  userName: string;
  bookingId: string;
  amount: string;
  date: string;
  companyName?: string;
  supportPhone?: string;
}

export const SportyRefundProcessed = ({
  userName = "Player 1",
  bookingId = "BK-123456",
  amount = "1200",
  date = "2024-12-25",
  companyName = "KRP Sports Zone",
  supportPhone = "+91 88838 88025",
}: SportyRefundProcessedProps) => {
  return (
    <Html>
      <Head />
      <Preview>Refund Processed 💸</Preview>
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
          <Section style={heroSection}>
            <Heading style={heroText}>REFUND ISSUED 💸</Heading>
            <Text style={subHeroText}>WE'VE SENT YOUR MONEY BACK.</Text>
          </Section>

          {/* Details Card */}
          <Section style={cardContainer}>
            <Text style={messageText}>
              Hi {userName}, your refund for booking{" "}
              <strong>{bookingId}</strong> has been initiated. It may take 5-7
              business days to reflect in your account.
            </Text>

            <Hr style={divider} />

            <Row>
              <Column>
                <Text style={label}>REFUND AMOUNT</Text>
                <Text style={value}>₹{amount}</Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text style={label}>PROCESSED ON</Text>
                <Text style={value}>{date}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Questions? Call {supportPhone} or reply to this email.
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

export default SportyRefundProcessed;

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

const heroSection = {
  padding: "40px 0",
  textAlign: "center" as const,
};

const heroText = {
  fontSize: "32px",
  fontWeight: "900",
  color: "#00ff99",
  margin: "0",
  fontStyle: "italic",
  textShadow: "0 0 10px rgba(0, 255, 153, 0.3)",
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
  lineHeight: "1.6",
  margin: "0 0 20px",
};

const label = {
  color: "#00ff99",
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
