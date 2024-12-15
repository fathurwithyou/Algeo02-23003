"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSetImagePreview } from "@/store/useImagePreviewStore"; // Adjust the import path as needed

export function InputFile() {
  const setImage = useSetImagePreview();

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Picture</Label>
      {/* filter input for only showing images extensions */}
      <Input
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            setImage(e.target.files[0]);
          } else {
            setImage(null);
          }
        }}
        id="picture"
        type="file"
        accept="image/*"
      />
    </div>
  );
}
