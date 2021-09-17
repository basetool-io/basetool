import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { withSentry } from "@sentry/nextjs";
// import BelongsToOrganization from "./middlewares/BelongsToOrganization";
// import GetSubdomain from "./middlewares/GetSubdomain";
import HandlesErrors from "./middlewares/HandlesErrors";

export type MiddlewareTuple = [
  (
    handler: NextApiHandler,
    args: Record<string, unknown>
  ) => NextApiHandler<any>,
  Record<string, unknown>
];

const startMiddlewares: MiddlewareTuple[] = [
  // [BelongsToOrganization, {}],
  // [GetSubdomain, {}],
];

const endMiddlewares: MiddlewareTuple[] = [
  [withSentry, {}],
  [HandlesErrors, {}],
];

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
      ...options?.middlewares || [],
      ...startMiddlewares,
    ];

    for (const tuple of allMiddlewares) {
      const [middleware, args] = tuple;
      handler = middleware(handler, args);
    }

    return handler(req, res);
  };
