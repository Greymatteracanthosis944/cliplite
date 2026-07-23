export interface ClipEntry {
  id: number;
  content: string;
  content_type: "text" | "image";
  source_app: string | null;
  pinned: boolean;
  created_at: string;
}
