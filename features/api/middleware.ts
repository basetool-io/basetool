import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { captureException } from "@sentry/nextjs";
import { errorResponse } from "@/lib/messages";
import { inProduction } from "@/lib/environment";
import { isNumber } from "lodash"
import ApiResponse from "./ApiResponse";

export type MiddlewareTuple = [
  (
    handler: NextApiHandler,
    args: Record<string, unknown>
  ) => NextApiHandler<any>,
  Record<string, unknown>
];

const startMiddlewares: MiddlewareTuple[] = [];

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
      // Show a prety message in production and throw the error in development
      if (inProduction) {
        if (!res.headersSent) {
          captureException(error);

          const status = error.code && isNumber(error.code) ? error.code : 500

          return res.status(status).send(
            ApiResponse.withError(errorResponse, {
              meta: { errorMessage: error.message, error },
            })
          );
        }
      } else {
        throw error;
      }
    }
  };
