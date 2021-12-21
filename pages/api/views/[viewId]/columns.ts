import { getUserFromRequest, getViewFromRequest } from "@/features/api";
import { isArray, isObjectLike } from "lodash";
import { serverSegment } from "@/lib/track";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import OwnsDataSource from "@/features/api/middlewares/OwnsDataSource";
import prisma from "@/prisma";
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
  const view = await getViewFromRequest(req);
  const user = await getUserFromRequest(req);

  const columnName = req?.body?.name as string;

  if (!view || !columnName) return res.status(404).send("");
  if (!isObjectLike(req.body)) return res.status(404).send("");

  const presentColumns = isArray(view.columns) ? view.columns : [];
  const columns = [...presentColumns, req.body];

  const result = await prisma.view.update({
    where: {
      id: parseInt(req.query.viewId as string, 10),
    },
    data: {
      columns,
    },
  });

  serverSegment().track({
    userId: user ? user?.id : "",
    email: user ? user?.email : "",
    event: "Added computed field",
  });

  return res.json(
    ApiResponse.withData(result, { message: `Added field ${req.body.name}` })
  );
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});
