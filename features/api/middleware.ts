import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { SQLError } from "@/lib/errors";
import { captureException, configureScope, flush } from "@sentry/nextjs";
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

    // If we use `handler` alone it somehow remains stored in memory and all the middlewares get doubled leading to increased loading times.
    let newHandler = handler;

    for (const tuple of allMiddlewares) {
      const [middleware, args] = tuple;
      newHandler = middleware(newHandler, args);
    }

    // Run the handler. If it crashes, log the error to Sentry and respond with a nice message.
    try {
      return await newHandler(req, res);
    } catch (error: any) {
      const user = await getUserFromRequest(req, {
        select: { id: true },
      });

      configureScope((scope) => {
        scope.setUser({
          id: user?.id?.toString(),
          name: `${user?.firstName} ${user?.lastName}`,
        });
        scope.setTags({
          dataSourceId: req.query.dataSourceId || req.body.dataSourceId,
          tableName: req.query.tableName || req.body.tableName,
          viewId: req.query.viewId || req.body.viewId,
          env: process.env.NEXT_PUBLIC_APP_ENV,
          useProxy: process.env.USE_PROXY,
          baseUrl: process.env.BASE_URL,
        });
      });

      captureException(error);

      // Flushing before returning is necessary if deploying to Vercel, see
      // https://vercel.com/docs/platform/limits#streaming-responses
      await flush(2000);

      // throw the error in the console in development
      if (inDevelopment) {
        console.error(error);
      }

      if (!res.headersSent) {
        const status = error.code && isNumber(error.code) ? error.code : 500;

        // For some reason, sometimes the sql error is not coming as instance of SQLError.
        if (
          error instanceof SQLError ||
          error.constructor.name === "SQLError"
        ) {
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
      }
    }
  };
