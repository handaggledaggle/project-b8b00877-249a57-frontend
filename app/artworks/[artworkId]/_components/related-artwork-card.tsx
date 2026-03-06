import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  artistName: string;
  priceKrw: number;
  thumbSrc: string;
  className?: string;
  wide?: boolean;
};

function formatKRW(n: number) {
  return new Intl.NumberFormat("ko-KR").format(n);
}

export default function RelatedArtworkCard({
  title,
  artistName,
  priceKrw,
  thumbSrc,
  className,
  wide
}: Props) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-xl border border-[#DDD6FE] bg-white shadow-lg",
        className
      )}
      data-component="card"
    >
      <div className={cn("relative w-full bg-gray-200", wide ? "h-56" : "h-48")}>
        <Image alt="related thumb" src={thumbSrc} fill className="object-cover" sizes="(min-width: 1440px) 340px, 30vw" />
      </div>
      <CardContent className="flex flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold text-[#4C1D95]">{title}</h3>
        <p className="text-sm text-[#6D28D9]">
          작가: {artistName} • ₩{formatKRW(priceKrw)}
        </p>
      </CardContent>
    </Card>
  );
}
