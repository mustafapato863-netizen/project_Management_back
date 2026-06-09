import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import type { Project, ProjectDatabase } from "./types.js";

// تفعيل قراءة متغيرات البيئة من ملف .env محلياً أو من سرفر Render الإنتاجي
dotenv.config();

const url = process.env.DATABASE_URL || "";
if (!url) {
  console.error(
    "⚠️ CRITICAL ERROR: DATABASE_URL environment variable is missing!",
  );
}

const client = new MongoClient(url);
const DB_NAME = "project_manager";
const COLLECTION_NAME = "projects";

// دالة مركزية للوصول لجدول المشاريع بـ MongoDB
async function getCollection() {
  await client.connect();
  const db = client.db(DB_NAME);
  return db.collection(COLLECTION_NAME);
}

// 1. جلب حالة قاعدة البيانات الإجمالية (تاريخ التحديث + العدد)
export async function getDatabase(): Promise<ProjectDatabase> {
  try {
    const collection = await getCollection();
    const projectsRaw = await collection.find({}).toArray();

    // تحويل الـ _id الخاص بـ MongoDB إلى id نصي متوافق مع الـ Frontend
    const projects = projectsRaw.map((p) => ({
      ...p,
      id: p._id.toString(),
    })) as unknown as Project[];

    // محاكاة بنية الـ JSON القديمة لإرضاء الـ Router
    return {
      updatedAt: new Date().toISOString(),
      projects: projects,
    };
  } catch (error) {
    console.error("MongoDB: Error fetching database structure", error);
    return { updatedAt: new Date().toISOString(), projects: [] };
  }
}

// 2. جلب قائمة كل المشاريع
export async function getProjects(): Promise<Project[]> {
  const dbData = await getDatabase();
  return dbData.projects;
}

// 3. جلب مشروع واحد بواسطة الـ ID
export async function getProjectById(id: string): Promise<Project | undefined> {
  try {
    const collection = await getCollection();
    // التحقق من صلاحية الـ ID حتى لا ينهار السيرفر إذا أرسل الـ Frontend نصاً عشوائياً
    if (!ObjectId.isValid(id)) return undefined;

    const project = await collection.findOne({ _id: new ObjectId(id) });
    if (!project) return undefined;

    return { ...project, id: project._id.toString() } as unknown as Project;
  } catch (error) {
    console.error(`MongoDB: Error fetching project with id ${id}`, error);
    return undefined;
  }
}

// 4. إنشاء مشروع جديد
export async function createProject(
  project: Omit<Project, "id" | "createdAt" | "updatedAt">,
): Promise<Project> {
  const collection = await getCollection();
  const now = new Date().toISOString();

  const newProjectData = {
    ...project,
    createdAt: now,
    updatedAt: now,
  };

  // MongoDB تولد الـ Unique ID تلقائياً في خانة _id
  const result = await collection.insertOne(newProjectData);

  return {
    ...newProjectData,
    id: result.insertedId.toString(),
  } as unknown as Project;
}

// 5. تحديث مشروع قائم
export async function updateProject(
  id: string,
  updates: Partial<Project>,
): Promise<Project | null> {
  try {
    const collection = await getCollection();
    if (!ObjectId.isValid(id)) return null;

    const now = new Date().toISOString();
    // إزالة الحقول الحساسة المعرفة مسبقاً حتى لا يتم تغييرها بالخطأ
    const { id: _, createdAt: __, updatedAt: ___, ...cleanUpdates } = updates;

    const finalUpdates = {
      ...cleanUpdates,
      updatedAt: now,
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: finalUpdates },
      { returnDocument: "after" }, // إرجاع المستند بعد التحديث
    );

    if (!result) return null;

    return { ...result, id: result._id.toString() } as unknown as Project;
  } catch (error) {
    console.error(`MongoDB: Error updating project with id ${id}`, error);
    return null;
  }
}

// 6. حذف مشروع
export async function deleteProject(id: string): Promise<boolean> {
  try {
    const collection = await getCollection();
    if (!ObjectId.isValid(id)) return false;

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  } catch (error) {
    console.error(`MongoDB: Error deleting project with id ${id}`, error);
    return false;
  }
}

// 7. دالة وهمية للحفاظ على توافقية الكود القديم إذا تمت مناداتها
export function getDatabaseFilePath(): string {
  return "CONNECTED_TO_MONGODB_ATLAS";
}
