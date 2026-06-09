import cors from "cors";
import express from "express";
import projectsRouter from "./routes/projects.js";
import { getDatabaseFilePath } from "./db.js";

const app = express();
const PORT = Number(process.env.PORT) || 8000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? true,
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    database: getDatabaseFilePath(),
  });
});

app.use("/api/projects", projectsRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Project Manager API running on http://localhost:${PORT}`);
  console.log(`JSON database: ${getDatabaseFilePath()}`);
});
