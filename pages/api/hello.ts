// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { captureException, withSentry } from "@sentry/nextjs";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.query.error) throw new Error(`hey errror ${req.query.error}`);
  if (req.query.lol) {
    try {
      throw new Error(`Lol errror ${req.query.lol}`);
    } catch (error) {
      captureException(error);

      return res.json({
        message: `There's been an error ${req.query.lol}`,
        error,
      });
    }
  }

  res.status(200).json({ name: "John Doe" });
};

export default withSentry(handler);
