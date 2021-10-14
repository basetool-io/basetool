import { DataSource } from "@prisma/client";
import { ListTable } from "@/plugins/data-sources/abstract-sql-query-service/types";
import { getDataSourceFromRequest } from "@/features/api";
import { isUndefined } from "lodash";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import OwnsDataSource from "@/features/api/middlewares/OwnsDataSource";
import getQueryService from "@/plugins/data-sources/getQueryService";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET":
      return handleGET(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = (await getDataSourceFromRequest(req)) as DataSource | null;

  if (!dataSource) return res.status(404).send("");

  const service = await getQueryService({ dataSource });

  const tables = (await service.runQuery("getTables")) as ListTable[];
  const storedTableData = (dataSource?.options as any)?.tables || {};
  let newTableData = [...tables];

  // If we have any, we'll assign the stored data to the tables we return.
  if (tables && storedTableData) {
    newTableData = tables.map((table) => {
      if (storedTableData[table.name]) {
        return {
          ...table,
          ...storedTableData[table.name],
        };
      } else {
        return table;
      }
    });
  }

  // Sort the tables by their orderIndex if tables has more than 1 element. If orderIndex has not been set, set it to 9999. We have to sort tables to have them in an order in the list.
  if(newTableData.length > 1) newTableData.sort((a: ListTable, b: ListTable) => {
    if (isUndefined(a.orderIndex)) a.orderIndex = 9999;
    if (isUndefined(b.orderIndex)) b.orderIndex = 9999;

    return a.orderIndex > b.orderIndex ? 1 : (b.orderIndex > a.orderIndex ? -1 : 0);
  });

  res.json(ApiResponse.withData(newTableData));
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});
