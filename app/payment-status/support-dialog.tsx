"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  trigger: React.ReactNode;
  defaultOrderId?: string;
  defaultName?: string;
  defaultEmail?: string;
};

export default function SupportDialog({
  trigger,
  defaultOrderId,
  defaultName,
  defaultEmail,
}: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ inquiryId: string } | null>(null);

  const [name, setName] = useState(defaultName ?? "");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [subject, setSubject] = useState("결제/다운로드 문의");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState(defaultOrderId ?? "");

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      message.trim().length > 0
    );
  }, [email, message, name]);

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    setDone(null);

    try {
      const res = await fetch("/api/support/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, orderId }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error ?? `요청 실패 (HTTP ${res.status})`);
      }
      setDone({ inquiryId: json.inquiry_id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setError(null);
          setDone(null);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>지원 요청</DialogTitle>
          <DialogDescription>
            결제 상태, 다운로드 문제, 환불 문의 등 필요한 내용을 남겨주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="support-orderId">주문번호(선택)</Label>
            <Input
              id="support-orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="예: ORD-20260306-12345"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="support-name">이름</Label>
              <Input
                id="support-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="구매자 이름"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="support-email">이메일</Label>
              <Input
                id="support-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="buyer@example.com"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="support-subject">제목</Label>
            <Input
              id="support-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="문의 제목"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="support-message">내용</Label>
            <textarea
              id="support-message"
              className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="문제 상황(예: 결제 실패 메시지, 다운로드 오류 화면 등)을 자세히 적어주세요."
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {done ? (
            <p className="text-sm text-emerald-700">
              접수되었습니다. 문의번호: <span className="font-semibold">{done.inquiryId}</span>
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            닫기
          </Button>
          <Button onClick={onSubmit} disabled={!canSubmit || submitting}>
            {submitting ? "전송 중..." : "지원 요청 등록"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
