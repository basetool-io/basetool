import { encrypt } from "@/lib/crypto";
import { getUserFromRequest } from "@/features/api";
import { google } from "googleapis";
import { serverSegment } from "@/lib/track";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import plugin from "@/plugins/data-sources/google-sheets";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getUserFromRequest(req);

  if (user) {
    // Create an oAuth2 client to authorize the API call
    const client = new google.auth.OAuth2(
      process.env.GSHEETS_CLIENT_ID,
      process.env.GSHEETS_CLIENT_SECRET,
      process.env.GSHEETS_REDIRECT_URI
    );

    // Create a state payload to reference the user who made this auth request
    const payload = {
      email: user?.email,
      name: req.body.name,
    };

    // Encrypt the data source info
    const encryptedPayload = encrypt(JSON.stringify(payload));

    // Generate the url that will be used for authorization
    const url = client.generateAuthUrl({
      // eslint-disable-next-line camelcase
      access_type: "offline",
      scope: plugin.oauthScopes,
      // Add to the state so we know who made the request.
      state: `payload=${encryptedPayload}`,
    });

    serverSegment().track({
      userId: user ? user.id : "",
      email: user ? user?.email : "",
      event: "Requested Google Sheets auth url",
    });

    return res.send(ApiResponse.withData({ url }));
  }

  res.redirect(302, "/auth/login");
};

export default withMiddlewares(handler);
