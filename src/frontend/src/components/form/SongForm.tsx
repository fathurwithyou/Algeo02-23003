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
  song: z.instanceof(File).refine((file) => file?.type.startsWith("audio/"), {
    message: "Please upload a valid audio file.",
  }),
});

export function SongForm() {
  // Define the form using react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      song: undefined,
    },
  });

  // Submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const formData = new FormData();
      formData.append("file", values.song);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("File uploaded successfully");
        form.reset({ song: undefined }); // Reset the form after successful upload
      } else {
        console.error("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }

  return (
    <Form {...form}>
      {form.watch("song") ? <AudioPlayer file={form.watch("song")} /> : null}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="song"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload Song</FormLabel>
              <FormControl>
                <Input
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    field.onChange(file); // Update form value
                  }}
                  id="song"
                  type="file"
                  accept="audio/*"
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
