"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  helpText?: string;
  accept?: string;
  tall?: boolean;
  busy?: boolean;
  fileName?: string | null;
  onFile: (file: File) => void | Promise<void>;
};

export default function FileDropzone({
  icon,
  title,
  description,
  helpText,
  accept,
  tall = true,
  busy = false,
  fileName,
  onFile,
}: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const pick = useCallback(() => inputRef.current?.click(), []);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const f = files?.item(0);
      if (!f) return;
      await onFile(f);
    },
    [onFile]
  );

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        className="sr-only"
        accept={accept}
        onChange={(e) => {
          void handleFiles(e.target.files);
        }}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={pick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") pick();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "w-full rounded-lg border border-[#DDD6FE] bg-white flex items-center justify-center text-[#6D28D9] cursor-pointer select-none",
          tall ? "h-36" : "h-28",
          dragOver && "ring-2 ring-[#A78BFA] bg-[#FAF5FF]"
        )}
      >
        <div className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2 font-medium">
            {busy ? <Loader2 className="size-4 animate-spin" /> : icon}
            <span>{title}</span>
          </div>
          {description && <div className="text-xs mt-1 text-[#6D28D9]">{description}</div>}
          {fileName && (
            <div className="mt-2 text-xs text-[#4C1D95]">
              선택됨: <span className="font-medium">{fileName}</span>
            </div>
          )}
          <div className="mt-3">
            <Button type="button" variant="secondary" className="text-[#6D28D9]" disabled={busy}>
              파일 선택
            </Button>
          </div>
        </div>
      </div>

      {helpText && <div className="text-xs text-[#6D28D9] mt-2">{helpText}</div>}
    </div>
  );
}
