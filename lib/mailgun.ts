import { flatten } from "lodash";
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
  public client: Client;

  constructor() {
    this.domain = process.env.MAILGUN_DOMAIN as string;
    this.from = "Basetool <adrian@basetool.io>";

    const mailgun = new Mailgun(formData);
    const config = {
      username: "api",
      key: process.env.MAILGUN_API_KEY || "",
      public_key: process.env.MAILGUN_PUBLIC_KEY || "",
    };
    this.client = mailgun.client(config);
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
      return this.client.messages.create(this.domain, body);
    } catch (error: any) {
      return error;
    }
  }
}

const mailgun = new EmailService();

export default mailgun;
