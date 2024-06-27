import { Router } from "express";
import { crawlerController } from "../controller/crawlerController";

const router = Router();

router.get('/:id', crawlerController);

export default router;