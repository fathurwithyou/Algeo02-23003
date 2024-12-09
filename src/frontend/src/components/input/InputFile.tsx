"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export function InputFile() {
    const [img, setImg] = useState();

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Picture</Label>
      {/* filter input for only showing images extensions */}
      <Input onChange={(e)=>{ setImg(e.target.files[0])} } id="picture" type="file" accept="image/*" />
    </div>
  )
}
