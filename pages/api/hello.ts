import { getUserFromRequest } from "@/features/api"
import { withMiddlewares } from "@/features/api/middleware";
import mailgun from "@/lib/mailgun"
import prisma from "@/prisma"
import { get, sum } from "lodash"
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // if (true) {
  //   serverSegment().track({
  //     userId: 1,
  //     event: "Added data source",
  //     properties: {
  //       id: 'postgresql',
  //       count: 1,
  //     },
  //   });
  // } else {
    try {
      const sent = await mailgun.send({
        to: ["hi@basetool.io"],
        subject: "New user signup",
        text: `New user with email ${"payload.email"} and organization ccc ${"payload.organization"}`,
        // html: `New user with email ${'payload.email'} and organization ${'payload.organization'}`,
      });

      console.log("sent->", sent);
    } catch (error) {
      console.log("error->", error);
    }
  // }


  // const user = await prisma.user.findFirst({
  //   where: {
  //     email: 'adrian@adrianthedev.com'
  //   },
  //   select: {
  //     organizations: {
  //       include: {
  //         organization: {
  //           include: {
  //             dataSources: {
  //               select: {
  //                 // _count: {
  //                   id: true
  //                 // }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // })
  // const count = sum(user?.organizations.map((orgUser) => orgUser.organization.dataSources.length))
  // console.log('count->', count)

  res.status(200).json({ name: "John Doe" });
};

export default withMiddlewares(handler);
