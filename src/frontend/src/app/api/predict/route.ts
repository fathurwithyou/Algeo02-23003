import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    console.log("FormData keys:", Array.from(formData.keys()));

    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      console.error("Invalid file received:", file);
      return NextResponse.json(
        { error: "No valid file received." },
        { status: 400 }
      );
    }

    const fileType = file.type;
    let backendUrl = "";

    const backendFormData = new FormData();
    if (fileType.startsWith("audio/")) {
      backendUrl = "http://localhost:5000/predict/audio";
      backendFormData.append("audio", file);
    } else if (fileType.startsWith("image/")) {
      backendUrl = "http://localhost:5000/predict/image";
      backendFormData.append("image", file);
    } else {
      console.error("Unsupported file type received:", fileType);
      return NextResponse.json(
        { error: "Unsupported file type received." },
        { status: 400 }
      );
    }

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

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error occurred during file upload:", error);
    return NextResponse.json({ error: "File upload failed", status: 500 });
  }
};
