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
  Hr,
  Button,
} from "@react-email/components";

interface SportyContactEmailProps {
  name: string;
  email: string;
  message: string;
}

export const SportyContactEmail = ({
  name = "Visitor",
  email = "visitor@example.com",
  message = "I want to book an event.",
}: SportyContactEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>New Message from {name} 📩</Preview>
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
            <Heading style={heroText}>NEW INQUIRY 📩</Heading>
          </Section>

          {/* Message Card */}
          <Section style={cardContainer}>
            <Text style={label}>FROM</Text>
            <Text style={value}>
              {name}{" "}
              <span style={{ color: "#666", fontSize: "12px" }}>({email})</span>
            </Text>

            <Hr style={divider} />

            <Text style={label}>MESSAGE</Text>
            <Text style={messageBody}>"{message}"</Text>

            <Section style={{ marginTop: "30px", textAlign: "center" }}>
              <Button style={button} href={`mailto:${email}`}>
                REPLY NOW
              </Button>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>© 2024 TurfBook Admin.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default SportyContactEmail;

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
  fontSize: "28px",
  fontWeight: "900",
  color: "#ffffff",
  margin: "0",
  fontStyle: "italic",
};

const cardContainer = {
  backgroundColor: "#111111",
  borderRadius: "16px",
  border: "1px solid #333",
  padding: "30px",
  marginTop: "20px",
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
  fontSize: "16px",
  fontWeight: "700",
  margin: "0",
};

const messageBody = {
  color: "#ccc",
  fontSize: "16px",
  fontStyle: "italic",
  lineHeight: "1.6",
  margin: "0",
};

const divider = {
  borderColor: "#333",
  margin: "20px 0",
};

const button = {
  backgroundColor: "#ccff00",
  color: "#000",
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
