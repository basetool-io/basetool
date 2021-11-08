import { Column } from "@/features/fields/types";
import { DataSource, View } from "@prisma/client";
import { getViewFromRequest } from "@/features/api";
import { get, isEmpty, isNull, isUndefined } from "lodash";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import OwnsDataSource from "@/features/api/middlewares/OwnsDataSource";
import getQueryService from "@/plugins/data-sources/getQueryService";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { hydrateColumns } from "@/features/records"

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET":
      return handleGET(req, res);
    // case "PUT":
    //   return handlePUT(req, res);
    // case "POST":
    //   return handlePOST(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const view = await getViewFromRequest(req);
  const dataSource = await prisma.dataSource.findUnique({
    where: {
      id: view?.dataSourceId,
    },
  });

  if (!view || !dataSource) return res.status(404).send("");

  const columns = await getColumns({ view, dataSource });

  res.json(ApiResponse.withData(columns));
}

export const getColumns = async ({
  view,
  dataSource,
}: {
  view: View;
  dataSource: DataSource;
}): Promise<Column[]> => {
  // If the data source has columns stored, send those in.
  const storedColumns = view.columns as Column[];
  // console.log("dataSource->", dataSource);

  const service = await getQueryService({
    dataSource,
    options: { cache: false },
  });

  let columns = await service.runQuery("getColumns", {
    tableName: view.tableName,
    storedColumns,
  });

  columns = hydrateColumns(columns, storedColumns);

  return columns;
};

// async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
//   const dataSource = await getDataSourceFromRequest(req);

//   if (!req.body.changes)
//     return res.send(ApiResponse.withError("No changes sent."));

//   if (!dataSource || !req?.query?.tableName) return res.status(404).send("");

//   const options = merge(dataSource.options, {
//     tables: {
//       [req.query.tableName as string]: {
//         columns: {
//           ...req.body.changes,
//         },
//       },
//     },
//   });

//   const result = await prisma.dataSource.update({
//     where: {
//       id: parseInt(req.query.dataSourceId as string, 10),
//     },
//     data: {
//       options,
//     },
//   });

//   return res.json(ApiResponse.withData(result, { message: "Updated" }));
// }

// async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
//   const dataSource = await getDataSourceFromRequest(req);

//   if (!dataSource || !req?.query?.tableName) return res.status(404).send("");

//   const options = merge(dataSource.options, {
//     tables: {
//       [req.query.tableName as string]: {
//         columns: {
//           [req.body.name]: req.body,
//         },
//       },
//     },
//   });

//   const result = await prisma.dataSource.update({
//     where: {
//       id: parseInt(req.query.dataSourceId as string, 10),
//     },
//     data: {
//       options,
//     },
//   });

//   return res.json(
//     ApiResponse.withData(result, { message: `Added field ${req.body.name}` })
//   );
// }

export default withMiddlewares(handler, {
  middlewares: [
    [IsSignedIn, {}],
    [OwnsDataSource, {}],
  ],
});
