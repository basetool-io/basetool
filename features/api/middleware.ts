import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { SQLError } from "@/lib/errors";
import { addBreadcrumb, captureException, flush } from "@sentry/nextjs";
import { errorResponse } from "@/lib/messages";
import { getUserFromRequest } from ".";
import { inDevelopment } from "@/lib/environment";
import { isNumber } from "lodash";
import ApiResponse from "./ApiResponse";
import VerifyKeepAlive from "./middlewares/VerifyKeepAlive";

export type MiddlewareTuple = [
  (
    handler: NextApiHandler,
    args: Record<string, unknown>
  ) => NextApiHandler<any>,
  Record<string, unknown>
];

const startMiddlewares: MiddlewareTuple[] = [[VerifyKeepAlive, {}]];

const endMiddlewares: MiddlewareTuple[] = [];

// This method will add the requested middlewares to all the handlers.
export const withMiddlewares =
  (
    handler: NextApiHandler,
    options?: {
      middlewares: MiddlewareTuple[];
    }
  ) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    // The middlewares will be run top-down (first ones on the list run first, last ones run last)
    const allMiddlewares: MiddlewareTuple[] = [
      ...endMiddlewares,
      ...(options?.middlewares || []),
      ...startMiddlewares,
    ];

    for (const tuple of allMiddlewares) {
      const [middleware, args] = tuple;
      handler = middleware(handler, args);
    }

    // Run the handler. If it crashes, log the error to Sentry and respond with a nice message.
    try {
      return await handler(req, res);
    } catch (error: any) {
      const user = await getUserFromRequest(req, {
        select: { id: true },
      });

      addBreadcrumb({
        message: "Session info",
        data: {
          userId: user?.id,
          dataSourceId: req.query.dataSourceId || req.body.dataSourceId,
        },
      });
      captureException(error);

      // Flushing before returning is necessary if deploying to Vercel, see
      // https://vercel.com/docs/platform/limits#streaming-responses
      await flush(2000);
      if (!res.headersSent) {
        const status = error.code && isNumber(error.code) ? error.code : 500;

        if (error instanceof SQLError) {
          res.status(status).send(
            ApiResponse.withError(error.message, {
              meta: { error },
            })
          );
        } else {
          // Show a prety message in production and
          res.status(status).send(
            ApiResponse.withError(errorResponse, {
              meta: { errorMessage: error.message, error },
            })
          );
        }

        // throw the error in the console in development
        if (inDevelopment) {
          throw error;
        }
      }
    }
  };
