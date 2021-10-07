import { DataSource } from "@prisma/client";
import { ListTable } from "@/plugins/data-sources/abstract-sql-query-service/types";
import { getDataSourceFromRequest } from "@/features/api";
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

  // If we have any, we'll assign the stored data to the tables we return.
  if (storedTableData) {
    tables.forEach((table) => {
      if (storedTableData[table.name]) {
        if (storedTableData[table.name].label) {
          table.label = storedTableData[table.name].label;
        }
        if (storedTableData[table.name].authorizedRoles) {
          table.authorizedRoles ||=
            storedTableData[table.name]?.authorizedRoles;
        }
      }
    });
  }

  res.json(ApiResponse.withData(tables));
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});
