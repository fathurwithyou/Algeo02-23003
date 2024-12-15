"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
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

// Validation schema
export const formSchema = z.object({
  mapper: z
    .array(z.instanceof(File))
    .refine((files) => files.every((file) => file?.type === "text/plain"), {
      message: "Please upload valid .txt files.",
    }),
});

export function MapperForm() {
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [inputText, setInputText] = useState("Choose files");

  // Define the form using react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mapper: [],
    },
  });

  // Submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const formData = new FormData();
      values.mapper.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/uploadMapper", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Files uploaded successfully");
        form.reset({ mapper: [] }); // Reset the form after successful upload
        setUploadSuccess(true); // Show success message
        setInputText("Choose files"); // Revert input text
        setTimeout(() => setUploadSuccess(false), 3000); // Hide after 3 seconds
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
          name="mapper"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload Mapper</FormLabel>
              <FormControl>
                <Input
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    field.onChange(files);
                    setInputText(
                      files.length > 0
                        ? `${files.length} file(s) selected`
                        : "Choose files"
                    );
                    e.target.value = "";
                  }}
                  id="mapper"
                  type="file"
                  accept=".txt"
                  multiple
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {uploadSuccess && (
          <div className="text-green-500">Files uploaded successfully!</div>
        )}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
