import { decrypt, encrypt } from "@/lib/crypto";
import { google } from "googleapis";
import { withSentry } from "@sentry/nextjs";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  // Get the user who granted this access.
  const rawState = req.query.state as string;
  // We sent the state as payoad=encryptedState
  const encryptedPayload = rawState.split("=")[1];
  if (!encryptedPayload) return res.redirect(302, "/auth/login?errorMessage=Bad response from Google Sheets.");

  const decryptedPayload = decrypt(encryptedPayload);

  let payload;
  try {
    payload = JSON.parse(decryptedPayload as string);
  } catch (error) {
    return res.redirect(302, "/auth/login?errorMessage=Failed to decrypt response from Google Sheets.");
  }
  const { email } = payload;

  const user = await prisma.user.findUnique({
    where: { email: email },
    include: {
      organizations: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (!user) return res.redirect(`/data-sources/google-sheets/new?errorMessage=Failed to find the user who initiate this request.`);

  const { organizations } = user;
  const [firstOrganizationPivot] = organizations;

  const code = req.query.code as string;

  // Create an oAuth2 client to authorize the API call
  const client = new google.auth.OAuth2(
    process.env.GSHEETS_CLIENT_ID,
    process.env.GSHEETS_CLIENT_SECRET,
    process.env.GSHEETS_REDIRECT_URI
  );

  /**
   * tokens schema:
   * {
   *  access_token: string,
   *  refresh_token: string,
   *  scope: 'https://www.googleapis.com/auth/spreadsheets',
   *  token_type: 'Bearer',
   *  expiry_date: timestamp,
   * }
   */
  await client.getToken(code, async (err, tokens) => {
    if (err) {
      console.error("Error getting oAuth tokens:");
      throw err;
    }

    const encryptedCredentials = encrypt(JSON.stringify({ tokens }));

    const data = {
      name: "Google Sheets",
      options: {
        spreadsheetId: null,
      },
      organizationId: firstOrganizationPivot?.organizationId,
      type: "google-sheets",
      encryptedCredentials,
    };

    const dataSource = await prisma.dataSource.create({
      data: data as any,
    });

    if (dataSource && dataSource.id) {
      res.redirect(`/data-sources/${dataSource.id}`);
    } else {
      res.redirect('/data-sources/google-sheets/new?errorMessage=Failed to find a data source.');
    }
  });
};

export default withSentry(handle);
