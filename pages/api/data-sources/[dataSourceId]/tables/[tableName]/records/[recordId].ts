import { Role as ACRole } from "@/features/roles/AccessControlService";
import { OrganizationUser, Role, User } from "@prisma/client";
import { Views } from "@/features/fields/enums";
import { getColumns } from "../columns";
import { getDataSourceFromRequest, getUserFromRequest } from "@/features/api";
import { getFilteredColumns } from "@/features/fields";
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

  const service = await getQueryService({ dataSource });

  // Get columns and filter them based on visibility
  const columns = await getColumns({ dataSource, tableName });

  const filteredColumns = getFilteredColumns(columns, Views.show).map(
    ({ name }) => name
  );

  const record = await service.runQuery("getRecord", {
    tableName: req.query.tableName as string,
    recordId: req.query.recordId as string,
    select: filteredColumns,
  });

  res.json(ApiResponse.withData(record));
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
