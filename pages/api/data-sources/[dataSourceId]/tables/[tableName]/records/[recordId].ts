import { Role as ACRole } from "@/features/roles/AccessControlService";
import { Column } from "@/features/fields/types";
import { OrganizationUser, Role, User } from "@prisma/client";
import { get } from "lodash";
import { getDataSourceFromRequest, getUserFromRequest } from "@/features/api";
import { hydrateColumns, hydrateRecord } from "@/features/records";
import { serverSegment } from "@/lib/track";
import { withMiddlewares } from "@/features/api/middleware";
import AccessControlService from "@/features/roles/AccessControlService";
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

  const service = await getQueryService({ dataSource });

  // If the data source has columns stored, send those in.
  const storedColumns = get(dataSource, [
    "options",
    "tables",
    tableName,
    "columns",
  ]);

  const [record, columns]: [any[], Column[]] = await service.runQueries([
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

  const service = await getQueryService({ dataSource });

  const data = await service.runQuery("updateRecord", {
    tableName: req.query.tableName as string,
    recordId: req.query.recordId as string,
    data: req.body.changes,
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
  const user = await getDataSourceFromRequest(req);
  const dataSource = await getDataSourceFromRequest(req);

  if (!dataSource) return res.status(404).send("");

  const service = await getQueryService({ dataSource });

  const data = await service.runQuery("deleteRecord", {
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
