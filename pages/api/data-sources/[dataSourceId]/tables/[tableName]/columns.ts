import { Column, IntermediateColumn } from "@/features/fields/types";
import { PostgresDataSource } from "@/plugins/data-sources/postgresql/types";
import { Views } from "@/features/fields/enums";
import { get, isArray } from "lodash";
import { getDataSourceFromRequest } from "@/features/api";
import { humanize } from "@/lib/humanize";
import { withSentry } from "@sentry/nextjs";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/pages/api/middleware/IsSignedIn";
import OwnsDataSource from "@/pages/api/middleware/OwnsDataSource";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import getQueryService from "@/plugins/data-sources/getQueryService";

const handle = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET":
      return handleGET(req, res);
    case "PUT":
      return handlePUT(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");

  // If the data source has columns stored, send those in.
  let storedColumns = get(dataSource, [
    "options",
    "tables",
    req.query.tableName as string,
    "columns",
  ]);

  if (isArray(storedColumns)) {
    storedColumns = storedColumns.map((column: Column) =>
      hydrateColumns(column)
    );
  }

  const QueryService = await getQueryService(dataSource);

  if (!QueryService) {
    return res.status(404).send("");
  }

  if (dataSource?.options?.url) {
    const service = new QueryService({ dataSource });

    await service.connect();

    const columns = await service.getColumns(
      req.query.tableName as string,
      storedColumns
    );

    await service.disconnect();

    res.json(ApiResponse.withData(columns));
  } else {
    res.status(404).send("");
  }
}

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  const dataSource = (await getDataSourceFromRequest(
    req
  )) as PostgresDataSource | null;

  if (!req.body.changes)
    return res.send(ApiResponse.withError("No changes sent."));

  if (dataSource && req?.query?.tableName) {
    const tableOptions = get(dataSource, [
      "options",
      "tables",
      req.query.tableName as string,
      "columns",
    ]);
    const result = await prisma.dataSource.update({
      where: {
        id: parseInt(req.query.dataSourceId as string, 10),
      },
      data: {
        options: {
          ...dataSource.options,
          tables: {
            [req.query.tableName as string]: {
              columns: {
                ...tableOptions,
                ...req.body.changes,
              },
            },
          },
        },
      },
    });

    return res.json(ApiResponse.withData(result, { message: "Updated" }));
  }

  res.status(404).send("");
}

const hydrateColumns = (column: Column | IntermediateColumn): Column => ({
  visibility: [Views.index, Views.show, Views.edit, Views.new],
  label: getColumnLabel(column),
  required: "required" in column && column?.required === true,
  nullable: "nullable" in column && column?.nullable === true,
  ...column,
});

const getColumnLabel = (column: Column | IntermediateColumn) => {
  if (column.name === "id") return "ID";

  return humanize(column.name);
};

export default withSentry(IsSignedIn(OwnsDataSource(handle)))
