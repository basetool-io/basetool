import { getViewFromRequest } from "@/features/api";
import { isObjectLike } from "lodash";
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
    case "PUT":
      return handlePUT(req, res);
    default:
      return res.status(404).send("");
  }
};

async function handlePUT(req: NextApiRequest, res: NextApiResponse) {
  // const user = await getUserFromRequest(req);
  // @todo: track this update
  const view = await getViewFromRequest(req, {
    select: {
      columns: true,
    },
  });

  const columnName = req.query.columnName as string;

  const columns: any = {
    ...(view?.columns as Record<string, unknown>),
    // [req.query.columnName as string]: req.body,
  };
  // console.log('initial columns->', (columns))
  // console.log('req.body->', req.body)
  Object.entries(req.body).map(([key, value]) => {
    // console.log('value->', key, value)
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

  // console.log('columns->', (columns))

  await prisma.view.update({
    where: {
      id: parseInt(req.query.viewId as string, 10),
    },
    data: {
      columns,
    },
  });

  // serverSegment().track({
  //   userId: user ? user.id : "",
  //   event: "Updated view",
  //   properties: {
  //     id: req.query.viewId,
  //   },
  // });

  return res.json(ApiResponse.ok());
}

export default withMiddlewares(handler, {
  middlewares: [[IsSignedIn, {}]],
});
