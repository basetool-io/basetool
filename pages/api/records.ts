import { Column } from "@/features/fields/types";
import { decodeObject } from "@/lib/encoding";
import { get } from "lodash";
import { getDataSourceFromRequest } from "@/features/api";
import { hydrateColumns, hydrateRecord } from "@/features/records";
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
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");

  const tableName = req.query.tableName as string;

  // If the data source has columns stored, send those in.
  const storedColumns = get(dataSource, [
    "options",
    "tables",
    tableName,
    "columns",
  ]);

  const service = await getQueryService({ dataSource });

  const filters = decodeObject(req.query.filters as string);

  const [records, columns, count]: [any[], Column[], number] =
    await service.runQueries([
      {
        name: "getRecords",
        payload: {
          tableName: req.query.tableName as string,
          filters,
          limit: req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : null,
          offset: req.query.offset
            ? parseInt(req.query.offset as string, 10)
            : null,
          orderBy: req.query.orderBy as string,
          orderDirection: req.query.orderDirection as string,
        },
      },
      {
        name: "getColumns",
        payload: {
          tableName,
          storedColumns,
        },
      },
      {
        name: "getRecordsCount",
        payload: {
          tableName: req.query.tableName as string,
          filters,
        },
      },
    ]);

  const hydratedColumns = hydrateColumns(columns, storedColumns);
  const newRecords = records.map((record) =>
    hydrateRecord(record, hydratedColumns)
  );

  res.json(ApiResponse.withData(newRecords, { meta: { count } }));
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});
