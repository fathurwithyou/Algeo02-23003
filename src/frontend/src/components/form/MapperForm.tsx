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
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Define the form using react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mapper: undefined,
    },
  });

  // Submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
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
        setUploadSuccess(true);
        setTimeout(() => {
          setUploadSuccess(false);
        }, 3000);
      } else {
        console.error("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
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
                    const file = e.target.files?.[0] || null;
                    field.onChange(file);
                  }}
                  id="mapper"
                  type="file"
                  accept=".txt,.json"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {uploadSuccess && (
          <div className="text-green-500">File uploaded successfully!</div>
        )}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
