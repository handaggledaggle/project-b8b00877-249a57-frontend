"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import AdminNavbar from "./admin-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Bell,
  CreditCard,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";

type OverviewResponse = {
  updatedAt: string;
  kpis: {
    gmv_krw_24h: number;
    purchases_24h: number;
    payment_webhook_success_rate_24h: number;
    refund_rate_30d: number;
    download_failure_rate_24h: number;
  };
};

type NotificationItem = {
  id: string;
  level: "info" | "warning" | "critical";
  title: string;
  message: string;
  createdAt: string;
};

type NotificationsResponse = {
  items: NotificationItem[];
};

function formatKRW(n: number) {
  return new Intl.NumberFormat("ko-KR").format(n);
}

function levelBadgeVariant(level: NotificationItem["level"]) {
  if (level === "critical") return "default" as const;
  if (level === "warning") return "secondary" as const;
  return "outline" as const;
}

function levelLabel(level: NotificationItem["level"]) {
  if (level === "critical") return "CRITICAL";
  if (level === "warning") return "WARNING";
  return "INFO";
}

function LevelIcon({ level }: { level: NotificationItem["level"] }) {
  if (level === "critical") return <ShieldAlert className="h-4 w-4" aria-hidden />;
  if (level === "warning") return <TriangleAlert className="h-4 w-4" aria-hidden />;
  return <Bell className="h-4 w-4" aria-hidden />;
}

export default function AdminConsoleClient() {
  const [overview, setOverview] = React.useState<OverviewResponse | null>(null);
  const [notifications, setNotifications] = React.useState<NotificationItem[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const nav = React.useMemo(
    () => [
      { key: "dashboard", label: "대시보드", href: "/admin/console", icon: LayoutDashboard },
      { key: "payments", label: "결제 모니터링", href: "/payment-status", icon: CreditCard },
    ],
    []
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [ov, ntf] = await Promise.all([
        fetch("/api/admin/overview", { cache: "no-store" }),
        fetch("/api/admin/notifications", { cache: "no-store" }),
      ]);

      if (!ov.ok) throw new Error("overview fetch failed");
      if (!ntf.ok) throw new Error("notifications fetch failed");

      const ovJson = (await ov.json()) as OverviewResponse;
      const ntfJson = (await ntf.json()) as NotificationsResponse;

      setOverview(ovJson);
      setNotifications(ntfJson.items);
    } catch {
      setError("데이터를 불러오지 못했습니다.");
      setOverview(null);
      setNotifications(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function onLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      // MVP: 세션이 없으므로 홈으로 이동
      window.location.href = "/";
    }
  }

  return (
    <div className="min-h-dvh bg-[#F7F5FF]">
      <AdminNavbar
        brandTitle="printtie Admin"
        nav={nav}
        operatorName="Demo Operator"
        onLogout={onLogout}
      />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#4C1D95]">운영 콘솔</h1>
            <p className="mt-1 text-sm text-[#6D28D9]">
              결제/웹훅/다운로드 품질 지표와 알림을 확인합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => void load()}
              className="border-[#DDD6FE] text-[#4C1D95]"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              새로고침
            </Button>
            <Button
              variant="outline"
              onClick={onLogout}
              className={cn(
                "border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              )}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              로그아웃
            </Button>
          </div>
        </div>

        {error ? (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">오류</CardTitle>
              <CardDescription className="text-red-700/80">{error}</CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-[#DDD6FE]">
            <CardHeader>
              <CardTitle className="text-base text-[#4C1D95]">24h GMV</CardTitle>
              <CardDescription>최근 24시간 총 거래액</CardDescription>
            </CardHeader>
            <CardContent>
              {loading || !overview ? (
                <Skeleton className="h-8 w-40" />
              ) : (
                <div className="text-2xl font-bold text-[#4C1D95]">
                  ₩{formatKRW(overview.kpis.gmv_krw_24h)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#DDD6FE]">
            <CardHeader>
              <CardTitle className="text-base text-[#4C1D95]">24h Purchases</CardTitle>
              <CardDescription>최근 24시간 구매 건수</CardDescription>
            </CardHeader>
            <CardContent>
              {loading || !overview ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <div className="text-2xl font-bold text-[#4C1D95]">
                  {formatKRW(overview.kpis.purchases_24h)}건
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#DDD6FE]">
            <CardHeader>
              <CardTitle className="text-base text-[#4C1D95]">Webhook Success</CardTitle>
              <CardDescription>최근 24시간 결제 웹훅 성공률</CardDescription>
            </CardHeader>
            <CardContent>
              {loading || !overview ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-[#4C1D95]">
                  {(overview.kpis.payment_webhook_success_rate_24h * 100).toFixed(1)}%
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#4C1D95]">알림</h2>
            {loading ? (
              <div className="text-xs text-muted-foreground">불러오는 중…</div>
            ) : overview ? (
              <div className="text-xs text-muted-foreground">
                업데이트: {new Date(overview.updatedAt).toLocaleString("ko-KR")}
              </div>
            ) : null}
          </div>

          <div className="mt-3 overflow-hidden rounded-xl border border-[#DDD6FE] bg-white">
            {loading || !notifications ? (
              <div className="space-y-3 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">알림이 없습니다.</div>
            ) : (
              <ul className="divide-y divide-[#EEE7FF]">
                {notifications.map((it) => (
                  <li key={it.id} className="p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[#4C1D95]">
                            <LevelIcon level={it.level} />
                          </span>
                          <div className="min-w-0 truncate font-semibold text-[#4C1D95]">
                            {it.title}
                          </div>
                          <Badge variant={levelBadgeVariant(it.level)} className="shrink-0">
                            {levelLabel(it.level)}
                          </Badge>
                        </div>
                        <div className="mt-1 text-sm text-[#6D28D9]">{it.message}</div>
                      </div>

                      <div className="shrink-0 text-xs text-muted-foreground">
                        {new Date(it.createdAt).toLocaleString("ko-KR")}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Separator className="my-6" />

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-[#DDD6FE]">
              <CardHeader>
                <CardTitle className="text-base text-[#4C1D95]">30d Refund Rate</CardTitle>
                <CardDescription>최근 30일 환불 비율</CardDescription>
              </CardHeader>
              <CardContent>
                {loading || !overview ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <div className="text-xl font-bold text-[#4C1D95]">
                    {(overview.kpis.refund_rate_30d * 100).toFixed(2)}%
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-[#DDD6FE]">
              <CardHeader>
                <CardTitle className="text-base text-[#4C1D95]">24h Download Failures</CardTitle>
                <CardDescription>최근 24시간 다운로드 실패율</CardDescription>
              </CardHeader>
              <CardContent>
                {loading || !overview ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <div className="text-xl font-bold text-[#4C1D95]">
                    {(overview.kpis.download_failure_rate_24h * 100).toFixed(2)}%
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex items-start gap-2 rounded-xl border border-[#DDD6FE] bg-white p-4">
            <ShieldAlert className="mt-0.5 h-4 w-4 text-[#6D28D9]" aria-hidden />
            <div className="text-sm text-[#4C1D95]">
              데모 화면입니다. 실제 운영 콘솔에서는 관리자 인증/권한, 실시간 스트림,
              경보 룰, 조치 기록(ack/resolve) 등이 추가됩니다.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
