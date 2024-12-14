import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const GET = async (req: NextRequest) => {
  try {
    const songsDirectory = path.join(process.cwd(), "public/songs");
    const files = fs
      .readdirSync(songsDirectory)
      .filter((file) =>
        [".mp3", ".wav", ".m4a"].includes(path.extname(file).toLowerCase())
      );

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = files.slice(startIndex, endIndex);

    return NextResponse.json({
      files: paginatedFiles.map((file) => path.basename(file)), // Return only the file names
      total: files.length,
      page,
      totalPages: Math.ceil(files.length / limit),
    });
  } catch (error) {
    console.error("Error fetching audio files:", error);
    return NextResponse.json(
      { error: "Failed to fetch audio files" },
      { status: 500 }
    );
  }
};
