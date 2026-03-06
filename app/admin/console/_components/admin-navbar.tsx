"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function AdminNavbar({
  brandTitle,
  nav,
  operatorName,
  onLogout,
}: {
  brandTitle: string;
  nav: { key: string; label: string; href: string; icon?: React.ElementType }[];
  operatorName: string;
  onLogout: () => void;
}) {
  return (
    <nav
      className="flex h-16 items-center justify-between border-b border-[#DDD6FE] bg-white px-6 shadow-sm sm:px-8"
      data-section-type="navbar"
    >
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="메뉴 열기">
              <Menu className="h-5 w-5" aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="text-[#4C1D95]">{brandTitle}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-1">
              {nav.map((n) => {
                const Icon = n.icon;
                return (
                  <Button
                    key={n.key}
                    asChild
                    variant="ghost"
                    className="justify-start text-[#4C1D95]"
                  >
                    <Link href={n.href}>
                      {Icon ? <Icon className="mr-2 h-4 w-4" aria-hidden /> : null}
                      {n.label}
                    </Link>
                  </Button>
                );
              })}
              <div className="mt-4 text-xs text-muted-foreground">운영자: {operatorName}</div>
              <Button
                onClick={onLogout}
                variant="outline"
                className="mt-2 border-[#DDD6FE] text-[#4C1D95]"
              >
                로그아웃
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <span className="text-xl font-bold text-[#4C1D95]">{brandTitle}</span>
      </div>

      <div className="hidden items-center gap-6 lg:flex">
        {nav.map((n) => (
          <Link
            key={n.key}
            href={n.href}
            className={cn("text-sm font-medium text-[#6D28D9] hover:underline")}
          >
            {n.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-sm text-gray-500 sm:block">운영자: {operatorName}</div>
        <Button
          onClick={onLogout}
          variant="secondary"
          className="bg-gray-100 text-[#6D28D9] hover:bg-gray-200"
        >
          로그아웃
        </Button>
      </div>
    </nav>
  );
}
