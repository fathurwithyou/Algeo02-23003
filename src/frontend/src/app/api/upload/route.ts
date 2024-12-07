import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    // Parse the incoming form data
    const formData = await req.formData();
    console.log("FormData keys:", Array.from(formData.keys())); // Debugging

    // Retrieve the file from the form data
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      console.error("Invalid file received:", file);
      return NextResponse.json(
        { error: "No valid file received." },
        { status: 400 }
      );
    }

    // Prepare file metadata
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.trim().replace(/\s+/g, "_"); // Sanitize filename
    const extension: string = path.extname(filename).toLowerCase();

    // Determine the save directory based on file type
    const directories: { [key: string]: string } = {
      ".jpg": "public/images/",
      ".jpeg": "public/images/",
      ".png": "public/images/",
      ".txt": "public/mapper/",
      ".wav": "public/songs/",
      ".mp3": "public/songs/",
      ".m4a": "public/songs/",
      ".mid": "public/songs/",
    };
    const directory = directories[extension] || "public/uploads/";

    // Ensure the directory exists before saving the file
    const fullPath = path.join(process.cwd(), directory);
    console.log(`Saving file to ${fullPath}${filename}`);

    await writeFile(path.join(fullPath, filename), buffer);

    // Respond with success
    return NextResponse.json({
      message: "File uploaded successfully",
      status: 201,
    });
  } catch (error) {
    console.error("Error occurred during file upload:", error);

    // Respond with an error
    return NextResponse.json({ error: "File upload failed", status: 500 });
  }
};
