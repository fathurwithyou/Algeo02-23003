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
import { useImagePreviewStore } from "@/store/useImagePreviewStore";

export const formSchema = z.object({
  images: z
    .array(z.instanceof(File))
    .refine((files) => files.every((file) => file?.type.startsWith("image/")), {
      message: "Please upload valid image files.",
    }),
});

export function ImageForm() {
  const { setImage } = useImagePreviewStore();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      images: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const formData = new FormData();
      values.images.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Files uploaded successfully");
        form.reset({ images: [] });
        setImage(null);
      } else {
        console.error("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload Images</FormLabel>
              <FormControl>
                <Input
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    field.onChange(files);
                    const firstImageFile = files.find((file) =>
                      file.type.startsWith("image/")
                    );
                    setImage(firstImageFile ?? null);
                  }}
                  id="images"
                  type="file"
                  accept="image/*"
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
