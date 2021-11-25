import { Column } from "@/features/fields/types";
import { DataSource, View } from "@prisma/client";
import { decodeObject } from "@/lib/encoding";
import { getDataSourceFromRequest, getViewFromRequest } from "@/features/api";
import { hydrateColumns, hydrateRecord } from "@/features/records";
import { merge } from "lodash";
import { runQueries } from "@/plugins/data-sources/serverHelpers";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import OwnsDataSource from "@/features/api/middlewares/OwnsDataSource";
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
  let tableName: string;
  let dataSource;
  let filters;
  let storedColumns: Column[] = [];
  const limit = parseInt(req.query.limit as string);
  const offset = parseInt(req.query.offset as string);
  const orderBy = req.query.orderBy as string;
  const orderDirection = req.query.orderDirection as string;

  if (req.query.viewId) {
    const view = (await getViewFromRequest(req, {
      include: {
        dataSource: true,
      },
    })) as View & {
      dataSource: DataSource;
    };

    if (!view || !view?.dataSource) return res.status(404).send("");

    dataSource = view?.dataSource;
    tableName = view?.tableName as string;
    storedColumns = view.columns as Column[];
    const decodedFilters = decodeObject(req.query.filters as string) || [];
    filters = merge(decodedFilters, view.filters);
  } else {
    dataSource = await getDataSourceFromRequest(req);

    if (!dataSource) return res.status(404).send("");
    tableName = req.query.tableName as string;
    filters = decodeObject(req.query.filters as string);
  }

  const startingAfter = req.query.startingAfter as string;
  const endingBefore = req.query.endingBefore as string;

  const [
    { records, columns: columnsFromRecords, meta },
    columnsFromDataSource,
    count,
  ] = await runQueries(dataSource, [
    {
      name: "getRecords",
      payload: {
        tableName,
        filters,
        limit,
        offset,
        orderBy,
        orderDirection,
        startingAfter,
        endingBefore,
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
        tableName,
        filters,
      },
    },
  ]);

  const columns = columnsFromRecords || columnsFromDataSource;

  const hydratedColumns = hydrateColumns(columns, storedColumns);
  const newRecords = records.map((record: Record<string, unknown>) =>
    hydrateRecord(record, hydratedColumns, "index")
  );

  res.json(
    ApiResponse.withData(newRecords, { meta: merge({ count, columns }, meta) })
  );
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});
