"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  UploadIcon,
  LoaderIcon,
  CheckIcon,
  XIcon,
  ClipboardIcon,
} from "lucide-react"; // Import icons from lucide-react
import { useSetIsReloading } from "@/store/useReloadStore";

// Validation schema
export const formSchema = z.object({
  mapper: z
    .instanceof(File)
    .refine(
      (file) =>
        file?.type === "text/plain" ||
        file?.name.toLowerCase().endsWith(".json"),
      {
        message: "Please upload a valid .txt or .json file.",
      }
    ),
});

export function MapperForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isHovered, setIsHovered] = useState(false);
  const setIsReloading = useSetIsReloading();

  // Define the form using react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mapper: undefined,
    },
  });

  // Submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.mapper) {
      console.error("No file selected");
      return;
    }

    setIsLoading(true);
    setUploadStatus("idle");

    try {
      const formData = new FormData();
      formData.append("file", values.mapper);

      const response = await fetch("/api/uploadMapper", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("File uploaded successfully");
        form.reset({ mapper: undefined });
        setUploadStatus("success");
        setTimeout(() => setUploadStatus("idle"), 2000);
        setIsHovered(false);
        setIsReloading(true);
      } else {
        console.error("File upload failed");
        setUploadStatus("error");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="mapper"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Input
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      field.onChange(file);
                      if (file) {
                        form.handleSubmit(onSubmit)();
                      }
                    }}
                    id="mapper"
                    type="file"
                    accept=".txt,.json"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById("mapper")?.click()}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`flex items-center justify-center w-10 h-10 bg-secondary rounded-md transition-transform transform duration-300 ease-in-out ${
                      isLoading || uploadStatus !== "idle"
                        ? "scale-90"
                        : isHovered
                        ? "scale-110"
                        : "scale-100"
                    }`}
                  >
                    {isLoading ? (
                      <LoaderIcon className="w-6 h-6 animate-spin" />
                    ) : uploadStatus === "success" ? (
                      <CheckIcon className="w-6 h-6" />
                    ) : uploadStatus === "error" ? (
                      <XIcon className="w-6 h-6" />
                    ) : isHovered ? (
                      <UploadIcon className="w-6 h-6" />
                    ) : (
                      <ClipboardIcon className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
