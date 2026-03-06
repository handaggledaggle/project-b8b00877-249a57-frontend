import type { Metadata } from "next";
import MypageClient from "./_components/mypage-client";

export const metadata: Metadata = {
  title: "마이페이지 — 구매/판매 이력 | printtie",
  description:
    "구매자는 주문·다운로드 기록을 확인하고, 아티스트는 판매 통계와 작품 관리를 할 수 있습니다.",
};

export default function Page() {
  return <MypageClient />;
}
