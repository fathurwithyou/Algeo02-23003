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
  MusicIcon,
} from "lucide-react"; // Import icons from lucide-react
import { useSetIsReloading } from "@/store/useReloadStore";

export const formSchema = z.object({
  songs: z
    .array(z.instanceof(File))
    .refine(
      (files) =>
        files.every(
          (file) =>
            file?.type.startsWith("audio/") ||
            file?.name.toLowerCase().endsWith(".zip") ||
            file?.name.toLowerCase().endsWith(".rar")
        ),
      {
        message: "Please upload valid audio or zip files.",
      }
    ),
});

export function SongForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isHovered, setIsHovered] = useState(false);
  const setIsReloading = useSetIsReloading();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      songs: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.songs.length === 0) {
      console.error("No files selected");
      return;
    }

    setIsLoading(true);
    setUploadStatus("idle");

    try {
      const formData = new FormData();
      values.songs.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/uploadAudio", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Files uploaded successfully");
        form.reset({ songs: [] });
        setUploadStatus("success");
        setTimeout(() => setUploadStatus("idle"), 1000);
        setIsHovered(false);
        setIsReloading(true);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="songs"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Input
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      field.onChange(files);
                      if (files.length > 0) {
                        form.handleSubmit(onSubmit)();
                      }
                    }}
                    id="songs"
                    type="file"
                    accept="audio/*,.zip,.rar"
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById("songs")?.click()}
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
                      <MusicIcon className="w-6 h-6" />
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
