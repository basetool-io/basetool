import { OAUTH_USER_ID_COOKIE } from "@/plugins/data-sources/google-sheets/constants";
import { OrganizationUser } from "@prisma/client";
import { User, withSentry } from "@sentry/nextjs";
import { getCookie } from "@/features/api/cookies";
import { google } from "googleapis";
import plugin from "@/plugins/data-sources/google-sheets";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { encrypt } from "@/lib/crypto"

const handle = async (req: NextApiRequest, res: NextApiResponse<string>) => {
  // Get the email of the account that granted the access.
  const idCookie = getCookie(req, OAUTH_USER_ID_COOKIE);
  // console.log('idCookie->', idCookie)

  // if (!idCookie) {
  //   res.redirect(302, "/auth/login");
  // } else {
    // const decryptedPayload = decrypt(idCookie)
    // const payload = JSON.parse(decryptedPayload)
    // console.log('payload->', payload)
    // const { email, name } = payload

    const user = await prisma.user.findUnique({
      where: { id: 11 },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    })

    // as User & {
    //   organizations: OrganizationUser[];
    // }

    console.log("user->", user, plugin);
    if (!user) return res.status(404).send("");

    const { organizations } = user;
    const [firstOrganizationPivot] = organizations;

    const code = req.query.code as string;
    console.log("code->", code);

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

      const encryptedCredentials = encrypt(JSON.stringify({tokens}))

      const data = {
        name: 'GSheets',
        options: {
          tokens,
        },
        organizationId: firstOrganizationPivot?.organizationId,
        type: "google-sheets",
        encryptedCredentials
      };

      const dataSource = await prisma.dataSource.create({
        data: data as any,
      });

      if (dataSource && dataSource.id) {
        res.redirect(`/data-sources/${dataSource.id}`);
      } else {
        res.send("Not good");
      }
    });
  // }
};

export default withSentry(handle);
