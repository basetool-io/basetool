import { Column } from "@/features/fields/types";
import { DataSource } from "@prisma/client";
import { get, isEmpty, merge } from "lodash";
import { getDataSourceFromRequest } from "@/features/api";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import OwnsDataSource from "@/features/api/middlewares/OwnsDataSource";
import getQueryService from "@/plugins/data-sources/getQueryService";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET":
      return handleGET(req, res);
    case "PUT":
      return handlePUT(req, res);
    case "POST":
      return handlePOST(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");
  const tableName = req.query.tableName as string;

  const columns = await getColumns({ dataSource, tableName });

  res.json(ApiResponse.withData(columns));
}

export const getColumns = async ({
  dataSource,
  tableName,
}: {
  dataSource: DataSource;
  tableName: string;
}): Promise<Column[]> => {
  // If the data source has columns stored, send those in.
  const storedColumns = get(dataSource, [
    "options",
    "tables",
    tableName as string,
    "columns",
  ]);

  const service = await getQueryService({
    dataSource,
    options: { cache: false },
  });

  let columns = await service.runQuery("getColumns", {
    tableName: tableName as string,
    storedColumns,
  });

  // Computed columns are bypassed in the database "getColumns", so we need to add them here.
  if (!isEmpty(storedColumns)) {
    const computedColumns = Object.values(storedColumns).filter(
      (column: any) => column?.baseOptions?.computed === true
    );
    if (!isEmpty(computedColumns)) {
      columns = columns.concat(computedColumns);
    }
  }

  return columns;
};

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = await getDataSourceFromRequest(req);

  if (!req.body.changes)
    return res.send(ApiResponse.withError("No changes sent."));

  if (!dataSource || !req?.query?.tableName) return res.status(404).send("");

  const options = merge(dataSource.options, {
    tables: {
      [req.query.tableName as string]: {
        columns: {
          ...req.body.changes,
        },
      },
    },
  });

  const result = await prisma.dataSource.update({
    where: {
      id: parseInt(req.query.dataSourceId as string, 10),
    },
    data: {
      options,
    },
  });

  return res.json(ApiResponse.withData(result, { message: "Updated" }));
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource || !req?.query?.tableName) return res.status(404).send("");

  const options = merge(dataSource.options, {
    tables: {
      [req.query.tableName as string]: {
        columns: {
          [req.body.name]: req.body,
        },
      },
    },
  });

  const result = await prisma.dataSource.update({
    where: {
      id: parseInt(req.query.dataSourceId as string, 10),
    },
    data: {
      options,
    },
  });

  return res.json(ApiResponse.withData(result, { message: `Added field ${req.body.name}` }));
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});
