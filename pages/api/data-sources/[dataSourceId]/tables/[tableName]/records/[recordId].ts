import { Role as ACRole } from "@/features/roles/AccessControlService";
import { Column } from "@/features/fields/types";
import { OrganizationUser, Role, User } from "@prisma/client";
import { get } from "lodash";
import { getDataSourceFromRequest, getUserFromRequest } from "@/features/api";
import { hydrateColumns, hydrateRecord } from "@/features/records";
import { runQueries, runQuery } from "@/plugins/data-sources/serverHelpers";
import { serverSegment } from "@/lib/track";
import { withMiddlewares } from "@/features/api/middleware";
import AccessControlService from "@/features/roles/AccessControlService";
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
    case "GET":
      return handleGET(req, res);
    case "PUT":
      return handlePUT(req, res);
    case "DELETE":
      return handleDELETE(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const user = (await getUserFromRequest(req, {
    select: {
      organizations: {
        include: {
          role: {
            select: {
              name: true,
              options: true,
            },
          },
        },
      },
    },
  })) as User & {
    organizations: Array<OrganizationUser & { role: Role }>;
  };

  const role = user.organizations[0].role;
  const ac = new AccessControlService(role as ACRole);

  if (!ac.readAny("record").granted) return res.status(403).send("");

  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");

  const tableName = req.query.tableName as string;
  const recordId = req.query.recordId as string;

  // If the data source has columns stored, send those in.
  const storedColumns = get(dataSource, [
    "options",
    "tables",
    tableName,
    "columns",
  ]);

  const [record, columns]: [any[], Column[]] = await runQueries(dataSource, [
    {
      name: "getRecord",
      payload: {
        tableName,
        recordId,
      },
    },
    {
      name: "getColumns",
      payload: {
        tableName,
        storedColumns,
      },
    },
  ]);

  const hydratedColumns = hydrateColumns(columns, storedColumns);
  const newRecord = hydrateRecord(record, hydratedColumns);

  res.json(ApiResponse.withData(newRecord));
}

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  if (!req?.body?.changes || Object.keys(req.body.changes).length === 0)
    return res.send(ApiResponse.withError("No changes sent."));
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");

  const user = await getUserFromRequest(req);

  const [record, data]: [Record<string, unknown>, Promise<unknown>] =
    await runQueries(dataSource, [
      {
        name: "getRecord",
        payload: {
          tableName: req.query.tableName as string,
          recordId: req.query.recordId as string,
        },
      },
      {
        name: "updateRecord",
        payload: {
          tableName: req.query.tableName as string,
          recordId: req.query.recordId as string,
          data: req.body.changes,
        },
      },
    ]);

  const changes = Object.keys(req?.body?.changes).map((columnName: string) => ({
    column: columnName,
    before: record[columnName],
    after: req?.body?.changes[columnName],
  }));

  // todo - find a way to pass viewId in the request
  const activityData = {
    recordId: req.query.recordId as string,
    userId: user ? user.id : 0,
    organizationId: dataSource ? (dataSource.organizationId as number) : 0,
    tableName: req.query.tableName
      ? (req.query.tableName as string)
      : undefined,
    dataSourceId: dataSource ? (dataSource.id as number) : undefined,
    viewId: req.query.viewId ? parseInt(req.query.viewId as string) : undefined,
    action: "update",
    changes: changes,
  };

  await prisma.activity.create({
    data: activityData as any,
  });

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Updated record",
    properties: {
      id: dataSource.type,
    },
  });

  res.json(
    ApiResponse.withData(data, {
      message: `Updated -> ${JSON.stringify(req?.body?.changes)}`,
    })
  );
}

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req);
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");

  const data = await runQuery(dataSource, "deleteRecord", {
    tableName: req.query.tableName as string,
    recordId: req.query.recordId as string,
  });

  serverSegment().track({
    userId: user ? user.id : "",
    event: "Deleted record",
    properties: {
      id: dataSource.type,
    },
  });

  // todo - find a way to pass viewId in the request
  const activityData = {
    recordId: req.query.recordId as string,
    userId: user ? user.id : 0,
    organizationId: dataSource ? (dataSource.organizationId as number) : 0,
    tableName: req.query.tableName
      ? (req.query.tableName as string)
      : undefined,
    dataSourceId: dataSource ? (dataSource.id as number) : undefined,
    viewId: req.query.viewId ? parseInt(req.query.viewId as string) : undefined,
    action: "delete",
    changes: {},
  };

  await prisma.activity.create({
    data: activityData,
  });

  res.json(
    ApiResponse.withData(data, {
      message: `Deleted -> record #${req.query.recordId} from ${req.query.tableName}`,
    })
  );
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});
