import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

//  */
export const apiErrorHandler =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ statusCode: 500, message: error });
    }
  };
