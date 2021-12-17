import { Column } from "@/features/fields/types";
import { getUserFromRequest, getViewFromRequest } from "@/features/api";
import { isArray, isUndefined } from "lodash";
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
    case "PUT":
      return handlePUT(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  const view = await getViewFromRequest(req);
  const order = req?.body?.order;

  if (!view || !order) return res.status(404).send("");

  const columns = view.columns;

  if (columns && isArray(columns)) {
    order.forEach((columnName: string, orderIndex: number) => {
      const columnIndex = (columns as Column[]).findIndex(
        (c) => c.name === columnName
      );

      if (columns && columnIndex > -1 && !isUndefined(columns[columnIndex])) {
        (columns[columnIndex] as any).baseOptions ||= {};
        (columns[columnIndex] as any).baseOptions.orderIndex = orderIndex;
      } else {
        columns.push({ name: columnName, baseOptions: { orderIndex } });
      }
    });

    await prisma.view.update({
      where: {
        id: parseInt(req.query.viewId as string, 10),
      },
      data: {
        columns: columns || {},
      },
    });

    const user = await getUserFromRequest(req);
    const dataSource = await prisma.dataSource.findUnique({
      where: {
        id: view.dataSourceId,
      },
    });

    if (dataSource)
      serverSegment().track({
        userId: user ? user.id : "",
        event: "Re-ordered fields in a view",
        properties: {
          id: dataSource.type,
          fieldsCount: order.length,
        },
      });
  }

  return res.json(ApiResponse.ok());
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});
