import { Column } from "@/features/fields/types";
import { getUserFromRequest, getViewFromRequest } from "@/features/api";
import { isArray, isObjectLike, merge } from "lodash";
import { serverSegment } from "@/lib/track";
import { withMiddlewares } from "@/features/api/middleware";
import ApiResponse from "@/features/api/ApiResponse";
import IsSignedIn from "@/features/api/middlewares/IsSignedIn";
import prisma from "@/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "DELETE":
      return handleDELETE(req, res);
    case "PUT":
      return handlePUT(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req);
  const view = await getViewFromRequest(req);

  const columnName = req?.query?.columnName as string;

  if (!view || !columnName || !isArray(view?.columns))
    return res.status(404).send("");

  const columns = (view.columns as { name: string }[]).filter(
    ({ name }) => name !== columnName
  );

  const result = await prisma.view.update({
    where: {
      id: parseInt(req.query.viewId as string, 10),
    },
    data: {
      columns,
    },
  });

  serverSegment().track({
    userId: user ? user?.id : "",
    event: "Removed computed field",
  });

  return res.json(
    ApiResponse.withData(result, { message: `Removed field ${columnName}` })
  );
}

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req);
  const view = await getViewFromRequest(req, {
    select: {
      columns: true,
    },
  });

  const columnName = req.query.columnName as string;

  const columns: any = [...(view?.columns as Column[])];

  const newColumn: any = {
    name: columnName,
  };

  Object.entries(req.body).map(([key, value]) => {
    if (key === "fieldType") {
      newColumn.fieldType = value;
    }
    if (key === "label") {
      newColumn.label = value;
    }

    if (isObjectLike(value)) {
      if (key === "baseOptions") {
        newColumn.baseOptions ||= {};
        newColumn.baseOptions = {
          ...newColumn.baseOptions,
          ...(value as Record<string, unknown>),
        };
      }

      if (key === "fieldOptions") {
        newColumn.fieldOptions ||= {};
        newColumn.fieldOptions = {
          ...newColumn.fieldOptions,
          ...(value as Record<string, unknown>),
        };
      }
    }
  });

  const columnIndex = columns.findIndex(
    (column: Column) => column.name === columnName
  );
  if (columns[columnIndex]) {
    columns[columnIndex] = merge(columns[columnIndex], newColumn);
  } else {
    columns.push(newColumn as Column);
  }

  await prisma.view.update({
    where: {
      id: parseInt(req.query.viewId as string, 10),
    },
    data: {
      columns,
    },
  });

  serverSegment().track({
    userId: user ? user?.id : "",
    event: "Updated computed field",
  });

  return res.json(ApiResponse.ok());
}

export default withMiddlewares(handler, {
  middlewares: [[IsSignedIn, {}]],
});
