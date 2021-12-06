import { captureMessage } from "@sentry/nextjs";
import { getUserFromRequest } from "@/features/api";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import email from "@/lib/email";
import logger from "@/lib/logger";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "POST":
      return handlePOST(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {

  const user = await getUserFromRequest(req);

  const emailData: any = {
    to: "hi@basetool.io",
    subject: `New feedback message from ${user?.email || ""}`,
    html: `<div>
            <p>From: ${user?.email || ""}</p>
            <p>Message: ${req.body.note}</p>
            <p>Emotion: ${req.body.emotion}</p>
            <p>Posted from URL: ${req.body.url}</p>
          </div>`,
    text: `From: ${user?.email || ""}; Message: ${req.body.note}; Emotion: ${req.body.emotion}; Posted from URL: ${req.body.url};`
  };

  try {
    await email.send(emailData);
  } catch (error: any) {
    logger.debug(error);
    captureMessage(`Failed to send email ${error.message}. Message: ${emailData.text}`);
  }

  return res.json(ApiResponse.withMessage("🙏🏼 Thank you!"));
}

export default withMiddlewares(handler, {
  middlewares: [[IsSignedIn, {}]],
});
