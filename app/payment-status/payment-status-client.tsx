"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  LifeBuoy,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import SupportDialog from "./support-dialog";

type PaymentStatus = "pending" | "paid" | "failed" | "delayed";

type OrderStatusResponse = {
  orderId: string;
  orderNumber: string;
  amountKRW: number;
  paymentMethodLabel: string;
  attemptedAt: string; // ISO
  status: PaymentStatus;
  statusReason?: string;
  buyer: {
    name: string;
    email: string;
  };
  downloadUrl?: string;
};

function formatKRW(amount: number) {
  try {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₩${amount.toLocaleString("ko-KR")}`;
  }
}

function formatKST(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  // Simple: render in local timezone; in KR deployments this will show KST.
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const ui = useMemo(() => {
    switch (status) {
      case "paid":
        return {
          label: "결제 승인",
          className:
            "bg-white/90 text-[#4C1D95] border border-white/40 shadow-sm",
          Icon: CheckCircle2,
        };
      case "failed":
        return {
          label: "결제 실패",
          className:
            "bg-white/90 text-[#4C1D95] border border-white/40 shadow-sm",
          Icon: XCircle,
        };
      case "delayed":
        return {
          label: "처리 지연",
          className:
            "bg-white/90 text-[#4C1D95] border border-white/40 shadow-sm",
          Icon: AlertTriangle,
        };
      default:
        return {
          label: "결제 진행 중",
          className:
            "bg-white/90 text-[#4C1D95] border border-white/40 shadow-sm",
          Icon: Loader2,
        };
    }
  }, [status]);

  const Icon = ui.Icon;
  return (
    <Badge className={cn("gap-1.5", ui.className)}>
      <Icon className={cn("h-4 w-4", status === "pending" && "animate-spin")} />
      {ui.label}
    </Badge>
  );
}

function StatusTitle({ status }: { status: PaymentStatus }) {
  switch (status) {
    case "paid":
      return "결제 승인";
    case "failed":
      return "결제 실패";
    case "delayed":
      return "처리 지연";
    default:
      return "결제 진행 중";
  }
}

function StatusDescription({ status }: { status: PaymentStatus }) {
  switch (status) {
    case "paid":
      return "결제가 승인되었습니다. 다운로드 링크와 영수증 정보를 확인하세요.";
    case "failed":
      return "결제에 실패했습니다. 실패 사유를 확인하고 재시도하거나 고객센터로 문의하세요.";
    case "delayed":
      return "결제사 응답 지연 또는 네트워크 문제로 상태 확인이 지연될 수 있습니다. 최대 5분간 자동 재시도될 수 있어요.";
    default:
      return "결제 승인 또는 실패 완료까지 잠시만 기다려주세요. 결제 API 응답을 수신하는 대로 화면이 갱신됩니다.";
  }
}

export default function PaymentStatusClient({ orderId }: { orderId: string }) {
  const [data, setData] = useState<OrderStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollRef = useRef<number | null>(null);

  const fetchStatus = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false;
      if (!silent) {
        setRefreshing(true);
      }
      setError(null);

      try {
        const res = await fetch(
          `/api/orders/status?orderId=${encodeURIComponent(orderId)}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? `요청 실패 (HTTP ${res.status})`);
        }
        const json = (await res.json()) as OrderStatusResponse;
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "알 수 없는 오류");
      } finally {
        setLoading(false);
        if (!silent) setRefreshing(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!data) return;

    const shouldPoll = data.status === "pending" || data.status === "delayed";
    if (!shouldPoll) {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
      return;
    }

    if (pollRef.current) return;

    pollRef.current = window.setInterval(() => {
      fetchStatus({ silent: true });
    }, 3000);

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [data, fetchStatus]);

  const onRetryPayment = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/orders/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `요청 실패 (HTTP ${res.status})`);
      }
      const json = (await res.json()) as { paymentUrl: string };
      // 데모: 결제창 URL로 이동
      window.location.href = json.paymentUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    }
  }, [orderId]);

  const orderNumber = data?.orderNumber ?? orderId;
  const amountKRW = data?.amountKRW ?? 18000;
  const attemptedAt = data?.attemptedAt ?? new Date().toISOString();
  const paymentMethodLabel = data?.paymentMethodLabel ?? "신용카드 (VISA)";
  const status: PaymentStatus = data?.status ?? "pending";

  const downloadHref =
    data?.downloadUrl ?? `/api/downloads/mock?orderId=${encodeURIComponent(orderId)}`;

  return (
    <div className="w-full flex flex-col bg-white">
      <nav
        className="h-16 bg-white border-b border-[#DDD6FE] shadow-sm flex items-center justify-between px-4 sm:px-8"
        data-section-type="navbar"
      >
        <Link href="/" className="text-xl font-bold text-[#4C1D95]">
          printtie
        </Link>

        <div className="hidden lg:flex gap-6">
          <Link className="text-[#6D28D9] hover:underline" href="#">
            작품 탐색
          </Link>
          <Link className="text-[#6D28D9] hover:underline" href="#">
            작품 등록
          </Link>
          <Link className="text-[#6D28D9] hover:underline" href="#">
            마이페이지
          </Link>
          <Link className="text-[#6D28D9] hover:underline" href="#">
            정책/문의
          </Link>
          <Link className="text-[#6D28D9] hover:underline" href="#">
            관리자 콘솔
          </Link>
        </div>

        <Button variant="secondary" className="text-[#6D28D9]">
          Sign Up
        </Button>
      </nav>

      <section
        data-section-type="hero"
        className="flex flex-col items-center py-10 sm:py-12 px-4 sm:px-8 bg-gradient-to-br from-[#7C3AED] to-[#A78BFA]"
      >
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">결제 상태</h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-white/70 mt-2">
              주문이 생성된 이후 결제 처리 현황과 결과, 다운로드 및 고객지원 정보를
              확인하세요.
            </p>

            <div className="mt-6 flex flex-col gap-4">
              <Card className="bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] border border-white/20 rounded-lg text-white">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">주문번호</p>
                    <p className="text-white font-semibold">{orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/70">총 결제금액</p>
                    <p className="text-white font-semibold">{formatKRW(amountKRW)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] border border-white/20 rounded-lg text-white">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-white/70">결제 수단</p>
                    <p className="text-white font-semibold">{paymentMethodLabel}</p>
                  </div>
                  <div className="flex flex-col sm:items-end">
                    <p className="text-sm text-white/70">결제 시도 시간</p>
                    <p className="text-white/90">{formatKST(attemptedAt)}</p>
                  </div>
                </CardContent>
              </Card>

              {error ? (
                <Card className="bg-white/90 border border-white/40">
                  <CardContent className="p-4 text-[#4C1D95]">
                    <p className="font-semibold">오류가 발생했습니다</p>
                    <p className="text-sm text-[#6D28D9] mt-1">{error}</p>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>

          <div className="w-full lg:w-80">
            <div className="flex flex-col gap-4">
              <Card className="bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] border border-white/20 rounded-lg text-white">
                <CardContent className="p-4">
                  <p className="text-sm text-white/70">결제 상태</p>
                  <p className="text-white font-semibold text-lg mt-1">
                    <StatusTitle status={status} />
                  </p>
                  <p className="text-white/70 text-sm mt-2">
                    <StatusDescription status={status} />
                  </p>

                  {status === "paid" ? (
                    <div className="mt-4 flex gap-2">
                      <Button asChild className="bg-white/90 text-[#4C1D95] hover:bg-white">
                        <a href={downloadHref}>
                          <Download className="h-4 w-4" />
                          다운로드
                        </a>
                      </Button>
                      <Button
                        variant="secondary"
                        className="bg-white/20 text-white hover:bg-white/30"
                        onClick={() => fetchStatus()}
                      >
                        <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                        새로고침
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <Button
                        variant="secondary"
                        className="bg-white/20 text-white hover:bg-white/30"
                        onClick={() => fetchStatus()}
                        disabled={refreshing}
                      >
                        <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                        주문 상태 새로고침
                      </Button>
                    </div>
                  )}

                  {loading ? (
                    <div className="mt-3 text-xs text-white/70 flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      상태를 불러오는 중...
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] border border-white/20 rounded-lg text-white">
                <CardContent className="p-4">
                  <p className="text-sm text-white/70">지원</p>
                  <p className="text-white/90 text-sm mt-2">
                    문제가 발생하면 고객센터로 문의하거나 결제 내역을 확인하세요.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      onClick={onRetryPayment}
                      className="bg-white/90 text-[#4C1D95] hover:bg-white"
                    >
                      결제 재시도
                    </Button>

                    <SupportDialog
                      trigger={
                        <Button
                          variant="secondary"
                          className="bg-white/20 text-white hover:bg-white/30"
                        >
                          <LifeBuoy className="h-4 w-4" />
                          문의하기
                        </Button>
                      }
                      defaultOrderId={orderNumber}
                      defaultName={data?.buyer.name}
                      defaultEmail={data?.buyer.email}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section
        data-section-type="features"
        className="flex flex-col items-center py-12 px-4 sm:px-8 bg-white shadow-lg"
      >
        <div className="w-full max-w-5xl">
          <h2 className="text-3xl font-bold text-[#4C1D95]">결제 상태별 안내</h2>
          <p className="text-lg text-[#6D28D9] mt-2">
            각 상태에서 제공되는 동작과 기대 결과를 확인하세요.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="bg-[#FFFFFF] rounded-xl border border-[#DDD6FE]">
              <CardHeader>
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <CardTitle className="text-xl font-semibold text-[#4C1D95] mt-3">
                  결제 승인
                </CardTitle>
                <CardDescription className="text-[#6D28D9]">
                  결제가 승인되면 주문이 완료되고 작품 다운로드 링크가 즉시
                  활성화됩니다. 이메일로 영수증이 발송됩니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  className="text-[#4C1D95] underline"
                  href={`/payment-status?orderId=${encodeURIComponent(orderId)}`}
                >
                  다운로드 바로가기
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-[#FFFFFF] rounded-xl border border-[#DDD6FE]">
              <CardHeader>
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <CardTitle className="text-xl font-semibold text-[#4C1D95] mt-3">
                  결제 실패
                </CardTitle>
                <CardDescription className="text-[#6D28D9]">
                  결제가 실패하면 실패 사유와 함께 재시도 옵션을 안내합니다.
                  필요 시 환불 절차가 자동으로 진행됩니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="text-[#4C1D95]" onClick={onRetryPayment}>
                  결제 재시도
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#FFFFFF] rounded-xl border border-[#DDD6FE]">
              <CardHeader>
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <CardTitle className="text-xl font-semibold text-[#4C1D95] mt-3">
                  처리 지연
                </CardTitle>
                <CardDescription className="text-[#6D28D9]">
                  결제 웹훅 지연이나 네트워크 문제로 상태가 불확실할 수 있습니다.
                  시스템은 최대 5분간 자동 재시도하며, 지연 시 알림을 발송합니다.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section
        data-section-type="form"
        className="flex flex-col items-center py-12 px-4 sm:px-8 bg-white shadow-lg"
      >
        <div className="w-full max-w-2xl">
          <Card className="p-0 bg-[#FAF5FF] rounded-xl border border-[#DDD6FE]">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="text-2xl font-bold text-[#4C1D95]">
                주문 상태 확인 / 고객 정보
              </CardTitle>
              <CardDescription className="text-[#6D28D9]">
                결제/다운로드 관련 문의 시 아래 정보를 함께 제공하면 더 빠르게
                도와드릴 수 있어요.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <div className="flex flex-col gap-4 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-[#4C1D95]">구매자 이름</p>
                    <div className="h-10 bg-white shadow-lg border border-[#DDD6FE] rounded-lg flex items-center px-3 text-[#4C1D95]">
                      {data?.buyer.name ?? "김아티스트"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-[#4C1D95]">이메일</p>
                    <div className="h-10 bg-white shadow-lg border border-[#DDD6FE] rounded-lg flex items-center px-3 text-[#4C1D95]">
                      {data?.buyer.email ?? "buyer@example.com"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-sm text-[#4C1D95]">특이사항 (선택)</p>
                  <div className="min-h-24 bg-white shadow-lg border border-[#DDD6FE] rounded-lg px-3 py-2 text-[#4C1D95]">
                    배송/다운로드 관련 요청이나 환불 문의 내용을 남겨주세요.
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-2">
                  <Button variant="outline" className="border-[#DDD6FE] text-[#4C1D95]" asChild>
                    <Link href={`/orders/${encodeURIComponent(orderId)}`}>주문 세부보기</Link>
                  </Button>

                  <SupportDialog
                    trigger={
                      <Button
                        variant="secondary"
                        className="bg-[#FAF5FF] text-[#4C1D95] hover:bg-[#F3E8FF]"
                      >
                        지원 요청 등록
                      </Button>
                    }
                    defaultOrderId={orderNumber}
                    defaultName={data?.buyer.name}
                    defaultEmail={data?.buyer.email}
                  />
                </div>

                <Separator className="mt-2 bg-[#DDD6FE]" />

                <div className="text-xs text-[#6D28D9]">
                  <p>
                    주문 상태는 <span className="font-semibold">웹훅 기반</span>으로
                    최종 확정됩니다. 화면 표시와 일시적으로 다를 수 있으며, 새로고침
                    시 갱신됩니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        data-section-type="faq"
        className="flex flex-col items-center py-12 px-4 sm:px-8 bg-[#FFFFFF]"
      >
        <div className="w-full max-w-3xl">
          <h2 className="text-3xl font-bold text-[#4C1D95]">자주 묻는 질문</h2>

          <div className="flex flex-col gap-4 mt-6">
            <Card className="bg-white shadow-lg rounded-lg border border-[#DDD6FE]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#4C1D95]">
                  결제 승인 후 다운로드 링크가 보이지 않습니다. 어떻게 하나요?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#6D28D9]">
                  결제 승인 직후 링크가 활성화됩니다. 보이지 않을 경우 페이지를
                  새로고침하거나 '주문 세부보기'에서 다운로드 항목을 확인하세요.
                  문제가 지속되면 지원 요청을 제출하세요.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg rounded-lg border border-[#DDD6FE]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#4C1D95]">
                  결제 실패 시 환불은 어떻게 진행되나요?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#6D28D9]">
                  신청한 결제에서 금액이 청구되었을 경우 자동 환불 또는 수동 환불
                  절차가 진행됩니다. 환불 처리 시간은 결제 수단에 따라 다르며,
                  상세 내역은 이메일로 안내됩니다.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg rounded-lg border border-[#DDD6FE]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#4C1D95]">
                  결제 상태가 '진행중'으로 오래 유지됩니다. 대기 시간은?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#6D28D9]">
                  대부분의 결제는 1~2분 내 처리됩니다. 외부 결제사 응답 지연 시
                  최대 5분까지 자동 재시도 후 최종 상태를 결정합니다. 지연이 길면
                  고객센터로 문의해 주세요.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section
        data-section-type="cta"
        className="flex flex-col items-center justify-center py-16 px-4 sm:px-8 bg-[#FAF5FF]"
      >
        <div className="w-full max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-[#4C1D95]">
            결제 상태를 계속 확인하세요
          </h2>
          <p className="text-lg text-[#6D28D9] mt-2">
            결제가 승인되면 즉시 다운로드 링크와 영수증을 제공합니다. 문제가 있을
            경우 지원을 요청하면 빠르게 도와드립니다.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <Button
              className="bg-[#FAF5FF] text-[#4C1D95] hover:bg-[#F3E8FF] border border-[#DDD6FE]"
              onClick={() => fetchStatus()}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              주문 상태 새로고침
            </Button>

            <SupportDialog
              trigger={
                <Button
                  variant="outline"
                  className="bg-white shadow-lg border border-[#DDD6FE] text-[#4C1D95]"
                >
                  지원 요청 만들기
                </Button>
              }
              defaultOrderId={orderNumber}
              defaultName={data?.buyer.name}
              defaultEmail={data?.buyer.email}
            />
          </div>
        </div>
      </section>

      <footer
        data-section-type="footer"
        className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 py-12 px-4 sm:px-8 bg-[#FFFFFF]"
      >
        <div className="flex flex-col gap-2">
          <span className="text-lg font-bold text-gray-900">printtie</span>
          <p className="text-[#6D28D9] text-sm">© 2026 printtie. All rights reserved.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-[#6D28D9] text-sm">Company</p>
            <p className="text-[#6D28D9] text-sm">About</p>
            <p className="text-[#6D28D9] text-sm">Careers</p>
            <p className="text-[#6D28D9] text-sm">Contact</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[#6D28D9] text-sm">지원</p>
            <p className="text-[#6D28D9] text-sm">이용약관</p>
            <p className="text-[#6D28D9] text-sm">개인정보처리방침</p>
            <p className="text-[#6D28D9] text-sm">환불정책</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[#6D28D9] text-sm">작가용</p>
            <p className="text-[#6D28D9] text-sm">작품 등록 가이드</p>
            <p className="text-[#6D28D9] text-sm">정산 안내</p>
            <p className="text-[#6D28D9] text-sm">운영정책</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[#6D28D9] text-sm">구매자</p>
            <p className="text-[#6D28D9] text-sm">구매 가이드</p>
            <p className="text-[#6D28D9] text-sm">다운로드 정책</p>
            <p className="text-[#6D28D9] text-sm">문의하기</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
