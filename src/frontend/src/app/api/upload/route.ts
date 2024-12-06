import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";

import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    console.log("FormData keys:", Array.from(formData.keys())); // Log keys to verify
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      console.error("Invalid file:", file);
      return NextResponse.json(
        { error: "No valid file received." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.replaceAll(" ", "_");
    console.log("Received file:", filename);

    await writeFile(
      path.join(process.cwd(), "public/images/" + filename),
      buffer
    );

    return NextResponse.json({ message: "Success", status: 201 });
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json({ message: "Failed", status: 500 });
  }
};
