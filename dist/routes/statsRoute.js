import express from "express";
import { adminOnly } from "../midlleware/auth.js";
import { getDashboardStats, getLineCharts, getBarCharts, getPieCharts } from "../controllers/statsController.js";
const statsRoute = express.Router();
statsRoute.get("/stats", adminOnly, getDashboardStats);
statsRoute.get("/pie", adminOnly, getPieCharts);
statsRoute.get("/bar", adminOnly, getBarCharts);
statsRoute.get("/line", adminOnly, getLineCharts);
export default statsRoute;
