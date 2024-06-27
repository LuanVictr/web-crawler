import { Request, Response } from "express";
import { crawlerService } from "../service/crawler";

 export const crawlerController = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const processInfo = await crawlerService(id);

    return res.status(200).json({processInfo});
  } catch (error: any) {
    return res.status(500).json({error: 'no process found with this id'});
  }
};
