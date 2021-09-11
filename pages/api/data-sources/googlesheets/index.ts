import handle from '@/plugins/data-sources/google-sheets/pages/api/sheets'

// import { NextApiRequest, NextApiResponse } from "next"

// const handle = async (
//   req: NextApiRequest,
//   res: NextApiResponse
// ): Promise<void> => {
//   return res.send("ypu");
// };


// We're exporting the handler from the plugin directory until next supports adding more directories for api routes.
export default handle
