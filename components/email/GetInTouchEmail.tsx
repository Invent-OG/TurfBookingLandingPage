// components/email/GetInTouchEmail.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
} from "@react-email/components";

type GetInTouchEmailProps = {
  name: string;
  email: string;
  message: string;
};

export const GetInTouchEmail = ({
  name,
  email,
  message,
}: GetInTouchEmailProps) => {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Heading>New Inquiry from {name}</Heading>
          <Text>
            <strong>Email:</strong> {email}
          </Text>
          <Text>
            <strong>Message:</strong> {message}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
