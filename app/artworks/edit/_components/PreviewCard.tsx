"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  artistName: string;
  category: string;
  priceLabel: string;
  thumbnailSrc: string | null;
  className?: string;
};

export default function PreviewCard({ title, artistName, category, priceLabel, thumbnailSrc, className }: Props) {
  return (
    <div className={cn("bg-white border border-[#DDD6FE] rounded-lg h-56 flex flex-col overflow-hidden", className)}>
      <div className="h-32 bg-gray-200 relative">
        {thumbnailSrc ? (
          <Image src={thumbnailSrc} alt={title} fill className="object-cover" sizes="384px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
            썸네일 미리보기
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="text-sm text-[#4C1D95] font-semibold line-clamp-1">{title}</div>
        <div className="text-xs text-[#6D28D9] mt-1 line-clamp-1">
          by {artistName} · {category} · {priceLabel}
        </div>
      </div>
    </div>
  );
}
