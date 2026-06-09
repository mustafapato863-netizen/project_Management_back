export type MilestoneStatus =
  | "Planned"
  | "In Progress"
  | "Completed"
  | "Delayed";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  dueDate: string;
  notes?: string;
  order?: number;
}

export type ProjectStatus = "Active" | "On Hold" | "Completed" | "Archived";
export type ProjectCategory =
  | "Development"
  | "Design"
  | "Marketing"
  | "Infrastructure"
  | "Research"
  | "Other";
export type ProjectPriority = "Low" | "Medium" | "High" | "Critical";

export interface ProjectLink {
  id: string;
  label: string;
  url: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  dueDate: string;
  notes?: string;
  links: ProjectLink[];
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDatabase {
  updatedAt: string;
  projects: Project[];
}
