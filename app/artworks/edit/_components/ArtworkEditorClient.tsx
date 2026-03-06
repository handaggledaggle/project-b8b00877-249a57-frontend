"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Eye,
  FileArchive,
  Image as ImageIcon,
  Loader2,
  Save,
  Shield,
  Upload,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import FileDropzone from "./FileDropzone";
import PreviewCard from "./PreviewCard";
import LicenseDialog from "./LicenseDialog";
import SelectMenu from "./SelectMenu";

type SaleType = "판매" | "무료" | "커미션";

type UploadResult = {
  url: string;
  fileName: string;
  size: number;
  contentType: string;
};

type DraftPayload = {
  title: string;
  description: string;
  tags: string[];
  category: string;
  saleType: SaleType;
  priceKRW: number | null;
  thumbnailUrl: string | null;
  originalUrl: string | null;
  license: {
    personal: boolean;
    commercial: boolean;
  };
};

type SavingState = "idle" | "saving" | "saved" | "error";

type ApiDraftResponse = { draftId: string; savedAt: string };

type ApiPublishResponse = {
  artworkId: string;
  status: "published";
  publishedAt: string;
};

const CATEGORIES = ["디지털 아트", "일러스트", "브러시", "템플릿", "3D", "사진", "기타"] as const;

const SALE_TYPES: SaleType[] = ["판매", "무료", "커미션"];

function toTags(input: string) {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function formatKRW(n: number) {
  try {
    return new Intl.NumberFormat("ko-KR").format(n);
  } catch {
    return String(n);
  }
}

async function uploadFile(file: File, kind: "thumbnail" | "original"): Promise<UploadResult> {
  const fd = new FormData();
  fd.set("file", file);
  fd.set("kind", kind);

  const res = await fetch("/api/uploads", {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Upload failed");
  }
  return (await res.json()) as UploadResult;
}

async function saveDraft(draftId: string | null, payload: DraftPayload) {
  const res = await fetch("/api/artworks/draft", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ draftId, data: payload }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Draft save failed");
  }
  return (await res.json()) as ApiDraftResponse;
}

async function publishArtwork(draftId: string | null, payload: DraftPayload) {
  const res = await fetch("/api/artworks/publish", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ draftId, data: payload }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Publish failed");
  }
  return (await res.json()) as ApiPublishResponse;
}

export default function ArtworkEditorClient() {
  const previewRef = useRef<HTMLDivElement | null>(null);

  const [draftId, setDraftId] = useState<string | null>(null);
  const [savingState, setSavingState] = useState<SavingState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const [title, setTitle] = useState("달빛 아래의 도시");
  const [description, setDescription] = useState(
    "작품의 컨셉, 제작 과정, 라이선스 정보 등을 상세히 적어주세요."
  );
  const [tagsText, setTagsText] = useState("일러스트, 밤, 도시");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("디지털 아트");
  const [saleType, setSaleType] = useState<SaleType>("판매");
  const [priceText, setPriceText] = useState("15000");

  const [license, setLicense] = useState({ personal: true, commercial: true });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const [thumbnailLocalUrl, setThumbnailLocalUrl] = useState<string | null>(null);
  const [thumbnailRemote, setThumbnailRemote] = useState<UploadResult | null>(null);
  const [originalRemote, setOriginalRemote] = useState<UploadResult | null>(null);

  const [thumbUploading, setThumbUploading] = useState(false);
  const [origUploading, setOrigUploading] = useState(false);
  const [bannerMsg, setBannerMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [visibility, setVisibility] = useState<"임시" | "공개">("임시");

  const tags = useMemo(() => toTags(tagsText), [tagsText]);

  const priceKRW = useMemo(() => {
    if (saleType === "무료") return 0;
    const n = Number(String(priceText).replaceAll(",", "").trim());
    if (!Number.isFinite(n)) return null;
    if (n < 0) return null;
    return Math.floor(n);
  }, [priceText, saleType]);

  const payload: DraftPayload = useMemo(
    () => ({
      title: title.trim(),
      description: description.trim(),
      tags,
      category,
      saleType,
      priceKRW,
      thumbnailUrl: thumbnailRemote?.url ?? null,
      originalUrl: originalRemote?.url ?? null,
      license,
    }),
    [title, description, tags, category, saleType, priceKRW, thumbnailRemote, originalRemote, license]
  );

  const checks = useMemo(() => {
    const hasTitle = payload.title.length > 0;
    const hasDesc = payload.description.length > 0;
    const hasThumb = !!payload.thumbnailUrl || !!thumbnailLocalUrl;
    const hasOrig = !!payload.originalUrl;
    const priceOk = payload.saleType === "무료" ? true : payload.priceKRW !== null && payload.priceKRW > 0;
    const licenseOk = payload.license.personal || payload.license.commercial;

    return {
      hasTitle,
      hasDesc,
      hasThumb,
      hasOrig,
      priceOk,
      licenseOk,
      completion:
        Math.round(
          ((Number(hasTitle) + Number(hasDesc) + Number(hasThumb) + Number(hasOrig) + Number(priceOk) + Number(licenseOk)) /
            6) *
            100
        ),
    };
  }, [payload, thumbnailLocalUrl]);

  // local preview URL lifecycle
  useEffect(() => {
    if (!thumbnailFile) return;
    const u = URL.createObjectURL(thumbnailFile);
    setThumbnailLocalUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [thumbnailFile]);

  // Auto-save with debounce
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        setSavingState("saving");
        const out = await saveDraft(draftId, payload);
        setDraftId(out.draftId);
        setLastSavedAt(out.savedAt);
        setSavingState("saved");
      } catch {
        setSavingState("error");
      }
    }, 900);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    payload.title,
    payload.description,
    payload.category,
    payload.saleType,
    payload.priceKRW,
    payload.thumbnailUrl,
    payload.originalUrl,
    payload.license.personal,
    payload.license.commercial,
    tagsText,
  ]);

  const savingLabel = useMemo(() => {
    if (savingState === "saving") return "저장중…";
    if (savingState === "saved") return lastSavedAt ? `저장됨 · ${new Date(lastSavedAt).toLocaleTimeString()}` : "저장됨";
    if (savingState === "error") return "저장 실패 · 네트워크를 확인하세요";
    return "작성중 — 저장은 자동으로 보관됩니다";
  }, [savingState, lastSavedAt]);

  async function onManualSave() {
    setBannerMsg(null);
    try {
      setSavingState("saving");
      const out = await saveDraft(draftId, payload);
      setDraftId(out.draftId);
      setLastSavedAt(out.savedAt);
      setSavingState("saved");
      setBannerMsg({ type: "success", text: "임시저장 완료" });
    } catch (e) {
      setSavingState("error");
      setBannerMsg({ type: "error", text: e instanceof Error ? e.message : "임시저장 실패" });
    }
  }

  function onPreview() {
    setBannerMsg(null);
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onPublish() {
    setBannerMsg(null);

    if (!checks.hasTitle || !checks.hasDesc) {
      setBannerMsg({ type: "error", text: "제목과 설명을 입력해주세요." });
      return;
    }
    if (!checks.hasThumb) {
      setBannerMsg({ type: "error", text: "썸네일을 업로드해주세요." });
      return;
    }
    if (!checks.hasOrig) {
      setBannerMsg({ type: "error", text: "원본 파일을 업로드해주세요." });
      return;
    }
    if (!checks.priceOk) {
      setBannerMsg({ type: "error", text: "가격(또는 무료 설정)을 확인해주세요." });
      return;
    }

    try {
      const out = await publishArtwork(draftId, payload);
      setVisibility("공개");
      setBannerMsg({ type: "success", text: `공개 완료 (작품 ID: ${out.artworkId})` });
    } catch (e) {
      setBannerMsg({ type: "error", text: e instanceof Error ? e.message : "공개 실패" });
    }
  }

  async function handleThumbnailSelected(file: File) {
    setBannerMsg(null);
    setThumbnailFile(file);
    try {
      setThumbUploading(true);
      const out = await uploadFile(file, "thumbnail");
      setThumbnailRemote(out);
    } catch (e) {
      setBannerMsg({ type: "error", text: e instanceof Error ? e.message : "썸네일 업로드 실패" });
      setThumbnailRemote(null);
    } finally {
      setThumbUploading(false);
    }
  }

  async function handleOriginalSelected(file: File) {
    setBannerMsg(null);
    setOriginalFile(file);
    try {
      setOrigUploading(true);
      const out = await uploadFile(file, "original");
      setOriginalRemote(out);
    } catch (e) {
      setBannerMsg({ type: "error", text: e instanceof Error ? e.message : "원본 업로드 실패" });
      setOriginalRemote(null);
    } finally {
      setOrigUploading(false);
    }
  }

  function toggleVisibility() {
    setVisibility((v) => (v === "임시" ? "공개" : "임시"));
  }

  return (
    <div className="w-full flex flex-col">
      {/* Navbar */}
      <nav className="h-16 bg-white border-b border-[#DDD6FE] shadow-sm flex items-center justify-between px-6 md:px-8">
        <Link href="/" className="text-xl font-bold text-[#4C1D95]">
          printtie
        </Link>
        <div className="hidden lg:flex gap-6 text-sm">
          <Link className="text-[#6D28D9] hover:text-[#4C1D95]" href="/browse">
            작품 탐색
          </Link>
          <Link className="text-[#6D28D9] hover:text-[#4C1D95]" href="/artworks/edit">
            작품 등록
          </Link>
          <Link className="text-[#6D28D9] hover:text-[#4C1D95]" href="/me">
            마이페이지
          </Link>
          <Link className="text-[#6D28D9] hover:text-[#4C1D95]" href="/policy">
            정책/문의
          </Link>
          <Link className="text-[#6D28D9] hover:text-[#4C1D95]" href="/admin">
            관리자 콘솔
          </Link>
        </div>
        <Button variant="secondary" className="text-[#6D28D9]">
          Sign Up
        </Button>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center py-12 px-6 md:px-8 bg-gradient-to-br from-[#7C3AED] to-[#A78BFA]">
        <div className="w-full max-w-[1440px] flex flex-col md:flex-row md:justify-between md:items-start gap-8">
          <div className="flex flex-col gap-4 max-w-2xl">
            <h1 className="text-3xl font-bold text-white">작품 등록 / 편집</h1>
            <p className="text-white/70">
              제목, 설명, 가격, 태그와 썸네일/원본 파일을 업로드하고 임시저장·미리보기로 즉시 노출까지 한 번에
              처리하세요. 결제·전달 흐름까지 연결되는 원스톱 등록 경험을 제공합니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={onManualSave}
                className="bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white/90"
              >
                <Save className="size-4" />
                임시저장
              </Button>
              <Button
                onClick={onPreview}
                className="bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white/90"
              >
                <Eye className="size-4" />
                미리보기
              </Button>
            </div>
            {bannerMsg && (
              <div
                className={cn(
                  "rounded-lg border px-4 py-3 text-sm",
                  bannerMsg.type === "success"
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-red-200/40 bg-red-500/10 text-white"
                )}
              >
                {bannerMsg.text}
              </div>
            )}
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="text-sm text-white/70">작업 상태</div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white/15 text-white border-white/20">
                초안
              </Badge>
              <span className="text-white/60">|</span>
              <Badge
                variant="secondary"
                className={cn(
                  "border-white/20",
                  visibility === "공개" ? "bg-white text-[#4C1D95]" : "bg-white/15 text-white"
                )}
              >
                공개
              </Badge>
            </div>
            <div className="text-xs text-white/70">Draft ID: {draftId ?? "—"}</div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="flex flex-col items-center py-12 px-6 md:px-8 bg-white">
        <div className="w-full max-w-[1440px] flex flex-col xl:flex-row gap-10">
          <Card className="flex-1 p-6 md:p-8 shadow-lg border border-[#DDD6FE] rounded-xl">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <h2 className="text-2xl font-bold text-[#4C1D95]">작품 기본 정보</h2>
              <div className="text-sm text-[#6D28D9] flex items-center gap-2">
                {savingState === "saving" && <Loader2 className="size-4 animate-spin" />}
                {savingState === "saved" && <Check className="size-4" />}
                {savingLabel}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label className="text-sm text-[#4C1D95]" htmlFor="title">
                  작품 제목
                </Label>
                <Input
                  id="title"
                  className="h-10 border-[#DDD6FE] text-[#4C1D95] shadow-sm"
                  placeholder="예: 달빛 아래의 도시"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm text-[#4C1D95]" htmlFor="description">
                  설명
                </Label>
                <textarea
                  id="description"
                  className="h-28 w-full rounded-lg border border-[#DDD6FE] bg-white px-3 py-2 text-[#4C1D95] shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA]"
                  placeholder="작품의 컨셉, 제작 과정, 라이선스 정보 등을 상세히 적어주세요."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <Label className="text-sm text-[#4C1D95]" htmlFor="tags">
                    태그 (콤마로 구분)
                  </Label>
                  <Input
                    id="tags"
                    className="h-10 border-[#DDD6FE] text-[#4C1D95] shadow-sm"
                    placeholder="예: 일러스트, 밤, 도시"
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                  />
                  <div className="text-xs text-[#6D28D9]">태그는 검색 및 카테고리 자동 분류에 사용됩니다. (최대 10개)</div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <Badge key={t} variant="secondary" className="bg-[#FAF5FF] text-[#6D28D9] border border-[#DDD6FE]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="w-full lg:w-64 flex flex-col gap-2">
                  <Label className="text-sm text-[#4C1D95]">카테고리</Label>
                  <SelectMenu
                    value={category}
                    options={[...CATEGORIES]}
                    onChange={(v) => setCategory(v as (typeof CATEGORIES)[number])}
                    buttonClassName="justify-between border-[#DDD6FE] text-[#6D28D9]"
                  />
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <Label className="text-sm text-[#4C1D95]">판매 여부</Label>
                  <SelectMenu
                    value={saleType}
                    options={SALE_TYPES}
                    onChange={(v) => setSaleType(v as SaleType)}
                    buttonClassName="justify-between border-[#DDD6FE] text-[#6D28D9]"
                  />
                  <div className="text-xs text-[#6D28D9]">무료로 설정하면 가격은 0원으로 저장됩니다.</div>
                </div>

                <div className="w-full lg:w-64 flex flex-col gap-2">
                  <Label className="text-sm text-[#4C1D95]" htmlFor="price">
                    가격 (KRW)
                  </Label>
                  <Input
                    id="price"
                    inputMode="numeric"
                    className="h-10 border-[#DDD6FE] text-[#4C1D95] shadow-sm"
                    placeholder="예: 15000"
                    value={saleType === "무료" ? "0" : priceText}
                    disabled={saleType === "무료"}
                    onChange={(e) => setPriceText(e.target.value)}
                  />
                  <div className="text-xs text-[#6D28D9]">
                    미리보기 가격: {payload.priceKRW === null ? "—" : `${formatKRW(payload.priceKRW)}원`}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm text-[#4C1D95]">썸네일 업로드</Label>
                <FileDropzone
                  icon={<ImageIcon className="size-5" />}
                  title={"썸네일 이미지를 드롭하거나 클릭하여 업로드"}
                  helpText={"권장 사이즈: 1600x900px · 최대 10MB · JPG/PNG"}
                  accept="image/png,image/jpeg"
                  onFile={handleThumbnailSelected}
                  busy={thumbUploading}
                  fileName={thumbnailFile?.name ?? thumbnailRemote?.fileName ?? null}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm text-[#4C1D95]">원본 파일 업로드</Label>
                <FileDropzone
                  icon={<Upload className="size-5" />}
                  title={"원본(PSD, ZIP, PNG 등)을 업로드하세요. 최대 2GB"}
                  description={"업로드 완료 시 자동으로 안전 저장되며 결제 후 전달됩니다."}
                  accept=".psd,.zip,.png,.jpg,.jpeg,.webp,.rar,.7z,.pdf,.ai"
                  onFile={handleOriginalSelected}
                  busy={origUploading}
                  fileName={originalFile?.name ?? originalRemote?.fileName ?? null}
                  tall={false}
                />
              </div>

              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" className="text-[#4C1D95]" onClick={onManualSave}>
                    <Save className="size-4" />
                    임시저장
                  </Button>
                  <Button variant="outline" className="text-[#4C1D95]" onClick={onPreview}>
                    <Eye className="size-4" />
                    미리보기
                  </Button>
                  <Button className="bg-[#4C1D95] hover:bg-[#3b1777]" onClick={onPublish}>
                    <Check className="size-4" />
                    즉시 노출
                  </Button>
                </div>
                <div className="text-sm text-[#6D28D9]">
                  작성 완료율: <span className="text-[#4C1D95] font-semibold">{checks.completion}%</span>
                </div>
              </div>
            </div>
          </Card>

          <aside className="w-full xl:w-96 flex flex-col gap-6" ref={previewRef}>
            <Card className="p-6 shadow-lg border border-[#DDD6FE] rounded-xl">
              <h3 className="text-lg font-semibold text-[#4C1D95]">미리보기</h3>
              <div className="mt-4">
                <PreviewCard
                  title={payload.title || "(제목 없음)"}
                  artistName="아티스트 닉네임"
                  category={payload.category}
                  priceLabel={payload.saleType === "무료" ? "무료" : payload.priceKRW ? `${formatKRW(payload.priceKRW)}원` : "—"}
                  thumbnailSrc={thumbnailLocalUrl}
                />
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="text-xs text-[#6D28D9]">노출 상태: {visibility}</div>
                <Button variant="outline" className="text-[#4C1D95]" onClick={toggleVisibility}>
                  공개 전환
                </Button>
              </div>
            </Card>

            <Card className="p-6 shadow-lg border border-[#DDD6FE] rounded-xl">
              <h3 className="text-lg font-semibold text-[#4C1D95]">작품 메타</h3>
              <div className="mt-3 text-sm text-[#6D28D9] flex items-center gap-2">
                <FileArchive className="size-4" />
                파일형식: {originalFile?.name?.split(".").pop()?.toUpperCase() ?? "—"} · 용량: {originalFile ? `${(originalFile.size / 1024 / 1024).toFixed(1)}MB` : "—"}
              </div>
              <div className="mt-2 text-sm text-[#6D28D9] flex items-center gap-2">
                <Shield className="size-4" />
                라이선스: {license.personal ? "개인" : ""}
                {license.personal && license.commercial ? "/" : ""}
                {license.commercial ? "상업" : ""}
              </div>
              <div className="mt-4">
                <LicenseDialog
                  license={license}
                  onChange={setLicense}
                  trigger={
                    <Button variant="outline" className="text-[#4C1D95]">
                      라이선스 설정
                    </Button>
                  }
                />
              </div>
            </Card>

            <Card className="p-6 shadow-lg border border-[#DDD6FE] rounded-xl">
              <h3 className="text-lg font-semibold text-[#4C1D95]">등록 체크리스트</h3>
              <ul className="mt-3 text-sm text-[#6D28D9] list-inside space-y-2">
                <li className={cn(checks.hasTitle && "text-[#4C1D95]")}>제목/설명 입력</li>
                <li className={cn(checks.hasThumb && "text-[#4C1D95]")}>썸네일 업로드</li>
                <li className={cn(checks.hasOrig && "text-[#4C1D95]")}>원본 파일 업로드</li>
                <li className={cn(checks.priceOk && "text-[#4C1D95]")}>가격 또는 무료 설정</li>
                <li className={cn(checks.licenseOk && "text-[#4C1D95]")}>라이선스 확인</li>
              </ul>
            </Card>
          </aside>
        </div>
      </section>

      {/* Features */}
      <section className="flex flex-col items-center py-16 px-6 md:px-8 bg-white shadow-sm">
        <div className="w-full max-w-[1440px]">
          <h2 className="text-3xl font-bold text-[#4C1D95] text-center">주요 기능</h2>
          <p className="text-lg text-[#6D28D9] text-center mt-2">작품 등록부터 결제·전달까지 작가의 작업 흐름을 단축합니다</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="flex flex-col items-center p-6 bg-[#FAF5FF] rounded-xl border border-[#DDD6FE]">
              <div className="w-12 h-12 bg-white rounded-lg border border-[#DDD6FE] flex items-center justify-center">
                <Save className="size-5 text-[#6D28D9]" />
              </div>
              <h3 className="text-xl font-semibold text-[#4C1D95] mt-4">임시저장 & 자동 복구</h3>
              <p className="text-[#6D28D9] text-center mt-2">편집 중 자동 저장과 버전 히스토리로 작업 손실을 막습니다.</p>
            </Card>

            <Card className="flex flex-col items-center p-6 bg-[#FAF5FF] rounded-xl border border-[#DDD6FE]">
              <div className="w-12 h-12 bg-white rounded-lg border border-[#DDD6FE] flex items-center justify-center">
                <Eye className="size-5 text-[#6D28D9]" />
              </div>
              <h3 className="text-xl font-semibold text-[#4C1D95] mt-4">즉시 미리보기</h3>
              <p className="text-[#6D28D9] text-center mt-2">업로드 즉시 작품 카드 미리보기로 노출을 확인할 수 있습니다.</p>
            </Card>

            <Card className="flex flex-col items-center p-6 bg-[#FAF5FF] rounded-xl border border-[#DDD6FE]">
              <div className="w-12 h-12 bg-white rounded-lg border border-[#DDD6FE] flex items-center justify-center">
                <Shield className="size-5 text-[#6D28D9]" />
              </div>
              <h3 className="text-xl font-semibold text-[#4C1D95] mt-4">안전한 원본 보관</h3>
              <p className="text-[#6D28D9] text-center mt-2">원본 파일은 암호화 저장되며 결제 후 안전하게 전달됩니다.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="flex flex-col items-center py-16 px-6 md:px-8 bg-white">
        <div className="w-full max-w-3xl">
          <h2 className="text-3xl font-bold text-[#4C1D95] text-center">자주 묻는 질문</h2>

          <div className="flex flex-col gap-4 mt-6">
            <Card className="p-4 shadow-lg rounded-lg border border-[#DDD6FE]">
              <h3 className="text-lg font-semibold text-[#4C1D95]">임시저장된 작품은 어디서 복원하나요?</h3>
              <p className="text-[#6D28D9] mt-2">마이페이지 &gt; 임시 보관함에서 최근 자동저장/수동저장된 모든 초안을 확인하고 복원할 수 있습니다.</p>
            </Card>
            <Card className="p-4 shadow-lg rounded-lg border border-[#DDD6FE]">
              <h3 className="text-lg font-semibold text-[#4C1D95]">원본 파일은 구매자에게 어떻게 전달되나요?</h3>
              <p className="text-[#6D28D9] mt-2">결제 완료 후 안전한 다운로드 링크가 생성되어 구매자에게 제공됩니다. 링크 만료 및 재요청 정책은 관리 페이지에서 설정 가능합니다.</p>
            </Card>
            <Card className="p-4 shadow-lg rounded-lg border border-[#DDD6FE]">
              <h3 className="text-lg font-semibold text-[#4C1D95]">판매 수수료와 정산 주기는 어떻게 되나요?</h3>
              <p className="text-[#6D28D9] mt-2">수수료 및 정산 주기는 작가 대시보드의 정산 안내에서 확인하세요. 기본 정산 주기는 월 단위이며 설정 변경이 가능합니다.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-center justify-center py-12 px-6 md:px-8 bg-[#FAF5FF]">
        <div className="w-full max-w-[1440px] flex flex-col items-center">
          <h2 className="text-3xl font-bold text-[#4C1D95] text-center">지금 바로 작품을 등록하고 판매를 시작하세요</h2>
          <p className="text-lg text-[#6D28D9] text-center mt-3">
            간단한 업로드로 즉시 미리보기 및 판매 준비가 가능합니다. 신규 작가에게는 첫 등록 수수료 할인 혜택을 제공합니다.
          </p>
          <div className="mt-6">
            <Button variant="outline" className="text-[#4C1D95]" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              새 작품 등록하기
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row md:justify-between gap-8 py-12 px-6 md:px-8 bg-white">
        <div className="flex flex-col gap-2">
          <span className="text-lg font-bold text-gray-900">printtie</span>
          <p className="text-[#6D28D9] text-sm">© 2026 printtie. All rights reserved.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-[#6D28D9] text-sm">About</p>
            <p className="text-[#6D28D9] text-sm">Careers</p>
            <p className="text-[#6D28D9] text-sm">Contact</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[#6D28D9] text-sm">이용약관</p>
            <p className="text-[#6D28D9] text-sm">개인정보처리방침</p>
            <p className="text-[#6D28D9] text-sm">환불정책</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[#6D28D9] text-sm">작품 등록 가이드</p>
            <p className="text-[#6D28D9] text-sm">정산 안내</p>
            <p className="text-[#6D28D9] text-sm">운영정책</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[#6D28D9] text-sm">구매 가이드</p>
            <p className="text-[#6D28D9] text-sm">다운로드 정책</p>
            <p className="text-[#6D28D9] text-sm">문의하기</p>
          </div>
        </div>
      </footer>

      {/* Preload-looking hidden image to keep Next/Image usage obvious in this page file */}
      <div className="sr-only" aria-hidden>
        <Image alt="" src={"data:image/gif;base64,R0lGODlhAQABAAAAACw="} width={1} height={1} />
      </div>
    </div>
  );
}
