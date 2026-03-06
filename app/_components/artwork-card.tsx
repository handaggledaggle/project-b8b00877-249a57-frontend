import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ArtworkCard(props: {
  layout: "compact" | "wide";
  title: string;
  price: string;
  meta: string;
  stats: string;
}) {
  const { layout, title, price, meta, stats } = props;

  if (layout === "wide") {
    return (
      <Card
        className="overflow-hidden rounded-xl border border-[#DDD6FE] bg-white shadow-lg"
        data-component="card"
      >
        <div className="h-56 w-full bg-gray-200" />
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#4C1D95]">{title}</h3>
            <p className="text-sm text-[#6D28D9]">{price}</p>
          </div>
          <p className="text-sm text-[#6D28D9]">{meta}</p>

          <div className="mt-2 flex items-center justify-between gap-4">
            <div className="text-sm text-[#6D28D9]">{stats}</div>
            <div className="flex w-[420px] gap-3">
              <Button
                variant="outline"
                className={cn(
                  "h-9 flex-1 rounded-lg border-[#DDD6FE] bg-white text-sm text-[#4C1D95] shadow-lg"
                )}
                data-component="button"
              >
                상세보기
              </Button>
              <Button
                variant="outline"
                className={cn(
                  "h-9 flex-1 rounded-lg border-[#DDD6FE] bg-white text-sm text-[#4C1D95] shadow-lg"
                )}
                data-component="button"
              >
                구매
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="overflow-hidden rounded-xl border border-[#DDD6FE] bg-white shadow-lg"
      data-component="card"
    >
      <div className="h-44 w-full bg-gray-200" />
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#4C1D95]">{title}</h3>
          <p className="text-sm text-[#6D28D9]">{price}</p>
        </div>
        <p className="text-sm text-[#6D28D9]">{meta}</p>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm text-[#6D28D9]">{stats}</div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-lg border-[#DDD6FE] bg-white px-3 text-sm text-[#4C1D95] shadow-lg"
              data-component="button"
            >
              상세보기
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-lg border-[#DDD6FE] bg-white px-3 text-sm text-[#4C1D95] shadow-lg"
              data-component="button"
            >
              구매
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
