"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type License = {
  personal: boolean;
  commercial: boolean;
};

type Props = {
  license: License;
  onChange: (next: License) => void;
  trigger: React.ReactNode;
};

export default function LicenseDialog({ license, onChange, trigger }: Props) {
  const pid = useId();
  const cid = useId();

  const [draft, setDraft] = useState<License>(license);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) setDraft(license);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#4C1D95]">라이선스 설정</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-[#6D28D9]">
            구매자가 사용할 수 있는 범위를 선택하세요. (MVP: 개인/상업 선택)
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-[#DDD6FE] p-4">
            <input
              id={pid}
              type="checkbox"
              className="mt-1"
              checked={draft.personal}
              onChange={(e) => setDraft((d) => ({ ...d, personal: e.target.checked }))}
            />
            <div>
              <Label htmlFor={pid} className="text-[#4C1D95]">
                개인용 허용
              </Label>
              <div className="text-xs text-[#6D28D9] mt-1">개인 프로젝트(배경화면, 개인 게시물 등) 사용을 허용합니다.</div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-[#DDD6FE] p-4">
            <input
              id={cid}
              type="checkbox"
              className="mt-1"
              checked={draft.commercial}
              onChange={(e) => setDraft((d) => ({ ...d, commercial: e.target.checked }))}
            />
            <div>
              <Label htmlFor={cid} className="text-[#4C1D95]">
                상업용 허용
              </Label>
              <div className="text-xs text-[#6D28D9] mt-1">상업 프로젝트(유료 상품/광고/브랜딩 등) 사용을 허용합니다.</div>
            </div>
          </div>

          {!(draft.personal || draft.commercial) && (
            <div className={cn("text-xs rounded-md border p-3", "border-red-200 bg-red-50 text-red-700")}>
              최소 1개 이상의 사용 범위를 선택해야 합니다.
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline">닫기</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className="bg-[#4C1D95] hover:bg-[#3b1777]"
              onClick={() => {
                if (!(draft.personal || draft.commercial)) return;
                onChange(draft);
              }}
            >
              저장
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
