import { NextResponse } from "next/server";
import path from "path";
import { writeFile, mkdir, readdir, unlink } from "fs/promises";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    console.log("FormData keys:", Array.from(formData.keys()));

    const files = formData.getAll("files");

    if (
      !files ||
      files.length === 0 ||
      !files.every((file) => file instanceof File)
    ) {
      console.error("Invalid files received:", files);
      return NextResponse.json(
        { error: "No valid files received." },
        { status: 400 }
      );
    }

    const audioExtensions = [".wav", ".mp3", ".m4a", ".mid"];
    const directory = "public/songs/";

    for (const file of files) {
      const buffer = Buffer.from(await (file as File).arrayBuffer());
      const filename = (file as File).name.trim().replace(/\s+/g, "_");
      const extension: string = path.extname(filename).toLowerCase();

      if (!audioExtensions.includes(extension)) {
        console.error("Invalid file type received:", extension);
        return NextResponse.json(
          { error: "Invalid file type received." },
          { status: 400 }
        );
      }

      const fullPath = path.join(process.cwd(), directory);
      await mkdir(fullPath, { recursive: true });

      // Delete previous files in the directory
      const existingFiles = await readdir(fullPath);
      for (const existingFile of existingFiles) {
        await unlink(path.join(fullPath, existingFile));
      }

      console.log(`Saving file to ${fullPath}${filename}`);
      await writeFile(path.join(fullPath, filename), buffer);
    }

    return NextResponse.json({
      message: "Files uploaded successfully",
      status: 201,
    });
  } catch (error) {
    console.error("Error occurred during file upload:", error);

    return NextResponse.json({ error: "File upload failed", status: 500 });
  }
};
