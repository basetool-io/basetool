import { Role as ACRole } from "@/features/roles/AccessControlService";
import { Column } from "@/features/fields/types";
import { DataSource, View } from "@prisma/client";
import { OrganizationUser, Role, User } from "@prisma/client";
import {
  getDataSourceFromRequest,
  getUserFromRequest,
  getViewFromRequest,
} from "@/features/api";
import { hydrateColumns, hydrateRecord } from "@/features/records";
import { runQueries } from "@/plugins/data-sources/serverHelpers";
import { withMiddlewares } from "@/features/api/middleware";
import AccessControlService from "@/features/roles/AccessControlService";
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

  const recordId = req.query.recordId as string;
  let tableName: string;
  let dataSource;
  let storedColumns: Column[] = [];

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
  } else {
    dataSource = await getDataSourceFromRequest(req);

    if (!dataSource) return res.status(404).send("");
    tableName = req.query.tableName as string;
  }

  const [record, columns]: [any[], Column[]] = await runQueries(
    dataSource,
    [{
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
  const newRecord = hydrateRecord(record, hydratedColumns, "show");

  res.json(ApiResponse.withData(newRecord));
}

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});
