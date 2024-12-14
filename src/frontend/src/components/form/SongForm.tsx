"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import AudioPlayer from "../audio/audio-player";

// Validation schema
export const formSchema = z.object({
  songs: z
    .array(z.instanceof(File))
    .refine((files) => files.every((file) => file?.type.startsWith("audio/")), {
      message: "Please upload valid audio files.",
    }),
});

export function SongForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      songs: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const formData = new FormData();
      values.songs.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Files uploaded successfully");
        form.reset({ songs: [] });
      } else {
        console.error("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  }

  return (
    <Form {...form}>
      {form.watch("songs")?.length > 0 ? (
        <AudioPlayer file={form.watch("songs")[0]} />
      ) : null}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="songs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload Songs</FormLabel>
              <FormControl>
                <Input
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    field.onChange(files); // Update form value
                  }}
                  id="songs"
                  type="file"
                  accept="audio/*"
                  multiple
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
