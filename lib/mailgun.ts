import { SMTPClient } from "emailjs";
import { flatten } from "lodash";
import { inProduction } from "./environment";
import Client from "mailgun.js/dist/lib/client";
import Mailgun from "mailgun.js";
import formData from "form-data";

type Success = {
  id: string;
  message: string;
};
type Fail = {
  status: number;
  details: string;
  page: string;
};

class EmailService {
  public domain: string;
  public from: string;
  public client: Client | SMTPClient;

  constructor() {
    this.domain = process.env.MAILGUN_DOMAIN as string;
    this.from = process.env.EMAIL_FROM || "Basetool <adrian@basetool.io>";

    const mailgun = new Mailgun(formData);
    const config = {
      username: "api",
      key: process.env.MAILGUN_API_KEY || "",
      public_key: process.env.MAILGUN_PUBLIC_KEY || "",
    };

    if (inProduction) {
      this.client = mailgun.client(config);
    } else {
      this.client = new SMTPClient({
        user: process.env.MAILTRAP_USERNAME,
        password: process.env.MAILTRAP_PASSWORD,
        host: "smtp.mailtrap.io",
        port: parseInt(process.env.MAILTRAP_PORT as string),
      });
    }
  }

  public async send({
    to,
    subject,
    text,
    html,
  }: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
  }): Promise<Success | Fail> {
    const body = {
      from: this.from,
      to: flatten([to]),
      subject: subject,
      text: text,
      html: html,
    };

    try {
      return this.sendMessage(body);
    } catch (error: any) {
      return error;
    }
  }

  private async sendMessage({
    to,
    subject,
    text,
    html,
  }: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
  }) {
    if (inProduction) {
      return (this.client as Client).messages.create(this.domain, {
        to,
        subject,
        text,
        html,
      });
    } else {
      return (this.client as SMTPClient).sendAsync({
        from: this.from,
        to,
        subject,
        text,
        attachment: [{ data: html, alternative: true }],
      } as any);
    }
  }
}

const mailgun = new EmailService();

export default mailgun;
