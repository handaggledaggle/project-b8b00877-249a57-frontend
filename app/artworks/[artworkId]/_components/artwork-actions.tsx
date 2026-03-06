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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Check, Copy, Heart, Share2 } from "lucide-react";

export default function ArtworkActions() {
  const [fav, setFav] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  async function onShare() {
    setCopied(false);

    // Web Share API (지원 브라우저에서만 동작)
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "printtie", url: window.location.href });
        return;
      } catch {
        // fall through to dialog
      }
    }

    setOpenShare(true);
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="rounded-lg bg-white px-4 py-2 text-[#4C1D95] hover:bg-gray-100"
          onClick={() => setFav((v) => !v)}
          aria-pressed={fav}
        >
          <Heart className={fav ? "fill-[#4C1D95]" : ""} />
          즐겨찾기
        </Button>
        <Button
          variant="ghost"
          className="rounded-lg bg-white px-4 py-2 text-[#4C1D95] hover:bg-gray-100"
          onClick={onShare}
        >
          <Share2 />
          공유
        </Button>
      </div>

      <Dialog open={openShare} onOpenChange={setOpenShare}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>공유</DialogTitle>
            <DialogDescription>
              링크를 복사해서 공유할 수 있어요.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2">
            <Input value={shareUrl} readOnly />
            <Button onClick={onCopy} className="gap-2">
              {copied ? <Check /> : <Copy />}
              {copied ? "복사됨" : "복사"}
            </Button>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenShare(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
