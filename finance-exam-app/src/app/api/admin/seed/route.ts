import { NextResponse } from "next/server";
import { seedData } from "@/lib/seed";

export async function POST() {
  try {
    const result = seedData();
    return NextResponse.json({
      success: true,
      message: "示例数据已导入",
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "导入失败",
      },
      { status: 500 }
    );
  }
}
