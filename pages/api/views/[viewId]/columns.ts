import { Column } from "@/features/fields/types";
import { DataSource, View } from "@prisma/client";
import { getViewFromRequest } from "@/features/api";
import { isEmpty, isNull, isUndefined } from "lodash";
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

  if (!view) return res.status(404).send("");

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
  const storedColumns = view.columns;
  // console.log("dataSource->", dataSource);

  const service = await getQueryService({
    dataSource,
    options: { cache: false },
  });

  let columns = await service.runQuery("getColumns", {
    tableName: view.tableName,
    storedColumns,
  });
  console.log('storedColumns->', columns, storedColumns)

  // Computed columns are bypassed in the database "getColumns", so we need to add them here.
  if (!isEmpty(storedColumns) && !isNull(storedColumns)) {
    const computedColumns = Object.values(storedColumns).filter(
      (column: any) => column?.baseOptions?.computed === true
    );
    if (!isEmpty(computedColumns)) {
      columns = columns.concat(computedColumns);
    }
  }

  // Sort the columns by their orderIndex if columns has more than 1 element. If orderIndex has not been set, set it to 9999.
  if (columns.length > 1)
    columns.sort((a: Column, b: Column) => {
      if (isUndefined(a.baseOptions.orderIndex))
        a.baseOptions.orderIndex = 9999;
      if (isUndefined(b.baseOptions.orderIndex))
        b.baseOptions.orderIndex = 9999;

      return a.baseOptions.orderIndex > b.baseOptions.orderIndex
        ? 1
        : b.baseOptions.orderIndex > a.baseOptions.orderIndex
        ? -1
        : 0;
    });

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
