import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "guides.json");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ guide: null, changes: null });
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ guide: null, changes: null });
  }
}
