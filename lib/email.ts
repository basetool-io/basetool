import { SMTPClient } from "emailjs";
import { flatten } from "lodash";

type Success = {
  id: string;
  message: string;
};
type Fail = {
  status: number;
  details: string;
  page: string;
};
type SendData = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
};

interface MailClient {
  send(data: SendData): Promise<any>;
}

class EmailService {
  public from: string;
  public client: MailClient;

  constructor() {
    this.from = process.env.EMAIL_FROM || "Basetool <hi@basetool.io>";

    this.client = new GenericSMTPClient(this.from);
  }

  public async send({
    to,
    subject,
    text,
    html,
  }: SendData): Promise<Success | Fail> {
    const body = {
      from: this.from,
      to: flatten([to]),
      subject: subject,
      text: text,
      html: html,
    };

    return this.client.send(body);
  }
}


class GenericSMTPClient implements MailClient {
  public from: string;
  public client: SMTPClient;

  constructor(from: string) {
    this.from = from;

    this.client = new SMTPClient({
      host: process.env.SMTP_HOST as string,
      port: parseInt(process.env.SMTP_PORT as string) || 587,
      user: process.env.SMTP_USER as string,
      password: process.env.SMTP_PASSWORD as string,
      tls: true,
    });
  }

  public async send({ to, subject, text, html }: SendData) {
    return (this.client as SMTPClient).sendAsync({
      from: this.from,
      to,
      subject,
      text,
      attachment: [{ data: html, alternative: true }],
    } as any);
  }
}

const email = new EmailService();

export default email;
