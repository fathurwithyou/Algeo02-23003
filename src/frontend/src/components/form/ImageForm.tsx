"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useImagePreviewStore } from "@/store/useImagePreviewStore"

export const formSchema = z.object({
  image: z
    .instanceof(File)
    .refine((file) => file?.type.startsWith("image/"), {
      message: "Please upload a valid image file.",
    }),

})

export function ImageForm() {
  const { setImage } = useImagePreviewStore()
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: undefined,
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    if (values.image?.name) {
      console.log("Selected image:", values.image?.name)
    }
  }




  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Choose image</FormLabel>
              <FormControl>
                {/* <Input placeholder="shadcn" {...field} /> */}
                <Input onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    e.target.files && e.target.files[0]
                    setImage(e.target.files[0])
                  }
                }} id="picture" type="file" accept="image/*" />
              </FormControl>
              {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )

}
