import { getUserFromRequest, getViewFromRequest } from "@/features/api";
import { isObjectLike, omit } from "lodash";
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

  if (!view || !columnName) return res.status(404).send("");

  const columns = omit(view.columns as Record<string, unknown>, [columnName]);

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

  const columns: any = {
    ...(view?.columns as Record<string, unknown>),
  };

  Object.entries(req.body).map(([key, value]) => {
    columns[columnName] ||= {};

    if (key === "fieldType") {
      columns[columnName].fieldType = value;
    }
    if (key === "label") {
      columns[columnName].label = value;
    }

    if (key === "baseOptions" && isObjectLike(value)) {
      columns[columnName].baseOptions ||= {};
      columns[columnName].baseOptions = {
        ...columns[columnName].baseOptions,
        ...(value as Record<string, unknown>),
      };
    }

    if (key === "fieldOptions") {
      columns[columnName].fieldOptions ||= {};
      columns[columnName].fieldOptions = {
        ...columns[columnName].fieldOptions,
        ...(value as Record<string, unknown>),
      };
    }
  });

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
