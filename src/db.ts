import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Project, ProjectDatabase } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../data");
const DB_FILE = path.join(DATA_DIR, "projects.json");

let writeQueue: Promise<unknown> = Promise.resolve();

function withWriteLock<T>(operation: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(operation, operation);
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function ensureDatabase(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DB_FILE);
  } catch {
    const initial: ProjectDatabase = {
      updatedAt: new Date().toISOString(),
      projects: [],
    };
    await fs.writeFile(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
  }
}

async function readDatabase(): Promise<ProjectDatabase> {
  await ensureDatabase();
  const raw = await fs.readFile(DB_FILE, "utf-8");
  return JSON.parse(raw) as ProjectDatabase;
}

async function writeDatabase(data: ProjectDatabase): Promise<void> {
  await ensureDatabase();
  const payload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  const tempFile = `${DB_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(payload, null, 2), "utf-8");
  await fs.rename(tempFile, DB_FILE);
}

export async function getDatabase(): Promise<ProjectDatabase> {
  return readDatabase();
}

export async function getProjects(): Promise<Project[]> {
  const db = await readDatabase();
  return db.projects;
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const db = await readDatabase();
  return db.projects.find((project) => project.id === id);
}

export async function createProject(
  project: Omit<Project, "id" | "createdAt" | "updatedAt">,
): Promise<Project> {
  return withWriteLock(async () => {
    const db = await readDatabase();
    const now = new Date().toISOString();
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    db.projects.push(newProject);
    await writeDatabase(db);
    return newProject;
  });
}

export async function updateProject(
  id: string,
  updates: Partial<Project>,
): Promise<Project | null> {
  return withWriteLock(async () => {
    const db = await readDatabase();
    const index = db.projects.findIndex((project) => project.id === id);

    if (index === -1) {
      return null;
    }

    const updatedProject: Project = {
      ...db.projects[index],
      ...updates,
      id: db.projects[index].id,
      createdAt: db.projects[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    db.projects[index] = updatedProject;
    await writeDatabase(db);
    return updatedProject;
  });
}

export async function deleteProject(id: string): Promise<boolean> {
  return withWriteLock(async () => {
    const db = await readDatabase();
    const nextProjects = db.projects.filter((project) => project.id !== id);

    if (nextProjects.length === db.projects.length) {
      return false;
    }

    db.projects = nextProjects;
    await writeDatabase(db);
    return true;
  });
}

export function getDatabaseFilePath(): string {
  return DB_FILE;
}
