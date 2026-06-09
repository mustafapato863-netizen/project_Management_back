import { Router } from "express";
import {
  createProject,
  deleteProject,
  getDatabase,
  getProjectById,
  getProjects,
  updateProject,
} from "../db.js";
import type { Project } from "../types.js";

const router = Router();

router.get("/meta", async (_req, res) => {
  try {
    const db = await getDatabase();
    res.json({
      updatedAt: db.updatedAt,
      count: db.projects.length,
    });
  } catch (error) {
    console.error("Failed to read project metadata:", error);
    res.status(500).json({ message: "Failed to read project metadata" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const projects = await getProjects();
    res.json(projects);
  } catch (error) {
    console.error("Failed to list projects:", error);
    res.status(500).json({ message: "Failed to list projects" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error("Failed to get project:", error);
    res.status(500).json({ message: "Failed to get project" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = req.body as Omit<Project, "id" | "createdAt" | "updatedAt">;

    if (!body?.name?.trim() || !body?.dueDate) {
      res.status(400).json({ message: "Project name and due date are required" });
      return;
    }

    const project = await createProject({
      name: body.name.trim(),
      description: body.description ?? "",
      category: body.category ?? "Development",
      status: body.status ?? "Active",
      priority: body.priority ?? "Medium",
      startDate: body.startDate ?? new Date().toISOString(),
      dueDate: body.dueDate,
      notes: body.notes ?? "",
      links: body.links ?? [],
      milestones: body.milestones ?? [],
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Failed to create project:", error);
    res.status(500).json({ message: "Failed to create project" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updates = req.body as Partial<Project>;
    const project = await updateProject(req.params.id, updates);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error("Failed to update project:", error);
    res.status(500).json({ message: "Failed to update project" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await deleteProject(req.params.id);

    if (!deleted) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete project:", error);
    res.status(500).json({ message: "Failed to delete project" });
  }
});

export default router;
