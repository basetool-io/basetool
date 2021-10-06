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
type SendData = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
};

interface MailClient {
  send(data: SendData): Promise<any>;
}

class MailgunClient implements MailClient {
  public domain: string;
  public from: string;
  public client: Client;

  constructor(domain: string, from: string) {
    this.domain = domain;
    this.from = from;
    const mailgun = new Mailgun(formData);
    const config = {
      username: "api",
      key: process.env.MAILGUN_API_KEY || "",
      public_key: process.env.MAILGUN_PUBLIC_KEY || "",
    };

    this.client = mailgun.client(config);
  }

  public async send({ to, subject, text, html }: SendData) {
    return (this.client as Client).messages.create(this.domain, {
      from: this.from,
      to,
      subject,
      text,
      html,
    });
  }
}

class MailtrapClient implements MailClient {
  public domain: string;
  public from: string;
  public client: SMTPClient;

  constructor(domain: string, from: string) {
    this.domain = domain;
    this.from = from;

    this.client = new SMTPClient({
      user: process.env.MAILTRAP_USERNAME,
      password: process.env.MAILTRAP_PASSWORD,
      host: "smtp.mailtrap.io",
      port: parseInt(process.env.MAILTRAP_PORT as string),
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

class EmailService {
  public domain: string;
  public from: string;
  public client: MailClient;

  constructor() {
    this.domain = process.env.MAILGUN_DOMAIN as string;
    this.from = process.env.EMAIL_FROM || "Basetool <adrian@basetool.io>";

    console.log('inProduction->', inProduction, this.domain, this.from, process.env.MAILGUN_PUBLIC_KEY)
    if (inProduction) {
      this.client = new MailgunClient(this.domain, this.from);
    } else {
      this.client = new MailtrapClient(this.domain, this.from);
    }
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

const mailgun = new EmailService();

export default mailgun;
