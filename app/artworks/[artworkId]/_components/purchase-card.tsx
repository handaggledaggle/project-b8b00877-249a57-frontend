"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { ExternalLink, MessageCircle, ShoppingCart } from "lucide-react";

function formatKRW(n: number) {
  return new Intl.NumberFormat("ko-KR").format(n);
}

type Props = {
  artworkId: string;
  priceKrw: number;
  vatNote: string;
  summary: string;
};

export default function PurchaseCard({ artworkId, priceKrw, vatNote, summary }: Props) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState<null | { order_id: string; payment_url: string; status: string }>(
    null
  );

  async function onPayNow() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ artwork_id: artworkId })
      });
      const data = (await res.json()) as { order_id: string; payment_url: string; status: string };
      setOrder(data);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card
        className="rounded-lg border border-[#DDD6FE] bg-white p-6 shadow-lg"
        data-component="pricing-card"
        data-section-type="pricing"
      >
        <CardContent className="p-0">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-[#6D28D9]">구매 옵션</span>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[#4C1D95]">₩{formatKRW(priceKrw)}</span>
              <span className="text-[#6D28D9]">{vatNote}</span>
            </div>
            <p className="text-sm text-[#6D28D9]">{summary}</p>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <Button
              className="w-full rounded-lg bg-[#FAF5FF] px-4 py-3 text-[#4C1D95] hover:bg-[#F3E8FF]"
              onClick={onPayNow}
              disabled={loading}
            >
              {loading ? "결제 준비중..." : "지금 결제하기"}
            </Button>

            <Button
              variant="outline"
              className="w-full rounded-lg border border-[#DDD6FE] bg-white px-4 py-3 text-[#4C1D95] shadow-lg"
              onClick={() => alert("장바구니에 담겼습니다(예시).")}
            >
              <ShoppingCart />
              장바구니에 담기
            </Button>

            <Button
              variant="outline"
              className="w-full rounded-lg border border-[#DDD6FE] bg-white px-4 py-3 text-[#4C1D95] shadow-lg"
              onClick={() => alert("문의 접수 플로우는 MVP에서 별도 페이지/폼으로 연결됩니다(예시).")}
            >
              <MessageCircle />
              문의 / 커스텀 요청
            </Button>
          </div>

          <div className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-[#6D28D9]">
              <span>결제 수단</span>
              <span className="text-[#4C1D95]">카드 · 계좌이체 · 간편결제</span>
            </div>
            <div className="flex justify-between text-[#6D28D9]">
              <span>배송(전달)</span>
              <span className="text-[#4C1D95]">즉시 다운로드</span>
            </div>
            <div className="flex justify-between text-[#6D28D9]">
              <span>환불</span>
              <span className="text-[#4C1D95]">정책 참조</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>결제 요청 생성 완료</DialogTitle>
            <DialogDescription>
              아래 링크는 예시 결제 URL입니다. 실제 Toss 결제창 연동 시 이 URL로 이동하거나 SDK를 호출합니다.
            </DialogDescription>
          </DialogHeader>

          {order ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">주문번호</span>
                <span className="font-medium">{order.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">상태</span>
                <span className="font-medium">{order.status}</span>
              </div>
              <div className="rounded-md border p-3">
                <div className="mb-2 text-muted-foreground">payment_url</div>
                <div className="break-all font-mono text-xs">{order.payment_url}</div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (order?.payment_url) window.open(order.payment_url, "_blank", "noopener,noreferrer");
              }}
              disabled={!order?.payment_url}
              className="gap-2"
            >
              <ExternalLink />
              결제 URL 열기
            </Button>
            <Button onClick={() => setOpen(false)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
