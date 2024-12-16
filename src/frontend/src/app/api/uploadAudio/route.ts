import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files");

    if (
      !files ||
      files.length === 0 ||
      !files.every((file) => file instanceof File)
    ) {
      return NextResponse.json(
        { error: "No valid files received." },
        { status: 400 }
      );
    }

    const backendUrl = "http://localhost:5000/upload/audio";

    const backendFormData = new FormData();
    files.forEach((file) => backendFormData.append("files", file));

    const response = await fetch(backendUrl, {
      method: "POST",
      body: backendFormData,
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: result.message, status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "File upload failed", status: 500 });
  }
};
