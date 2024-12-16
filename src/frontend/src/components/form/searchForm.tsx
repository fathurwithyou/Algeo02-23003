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
import { LoaderIcon, CheckIcon, XIcon, SearchIcon } from "lucide-react"; // Import icons from lucide-react

export const formSchema = z.object({
  predictions: z
    .array(z.instanceof(File))
    .refine(
      (files) =>
        files.every(
          (file) =>
            file?.type.startsWith("image/") || file?.type.startsWith("audio/")
        ),
      {
        message: "Please upload valid image or audio files.",
      }
    ),
});

export function SearchForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isHovered, setIsHovered] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      predictions: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.predictions.length === 0) {
      console.error("No files selected");
      return;
    }

    setIsLoading(true);
    setUploadStatus("idle");

    try {
      const formData = new FormData();
      values.predictions.forEach((file) => {
        formData.append("file", file);
      });

      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Files uploaded successfully");
        form.reset({ predictions: [] });
        setUploadStatus("success");
        setTimeout(() => setUploadStatus("idle"), 2000);
        setIsHovered(false);
      } else {
        console.error("File upload failed");
        setUploadStatus("error");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadStatus("error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-8">
        <FormField
          control={form.control}
          name="predictions"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Input
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      console.log("Selected files:", files);
                      field.onChange(files);
                      if (files.length > 0) {
                        form.handleSubmit(onSubmit)();
                      }
                    }}
                    id="predictions"
                    type="file"
                    accept="image/*,audio/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("predictions")?.click()
                    }
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
                    ) : (
                      <SearchIcon className="w-6 h-6" />
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
