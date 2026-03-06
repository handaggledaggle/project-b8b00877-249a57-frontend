import Link from "next/link";

import { Button } from "@/components/ui/button";
import { HomeInteractive } from "@/app/_components/home-interactive";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <div className="flex flex-col">
        {/* Navbar */}
        <nav
          className="flex h-16 items-center justify-between border-b border-[#DDD6FE] bg-white px-8 shadow-sm"
          data-section-type="navbar"
        >
          <span className="text-xl font-bold text-[#4C1D95]">printtie</span>

          <div className="flex gap-6">
            <Link href="#" className="text-[#6D28D9]">
              작품 탐색
            </Link>
            <Link href="#" className="text-[#6D28D9]">
              작품 등록
            </Link>
            <Link href="#" className="text-[#6D28D9]">
              마이페이지
            </Link>
            <Link href="#" className="text-[#6D28D9]">
              정책/문의
            </Link>
            <Link href="#" className="text-[#6D28D9]">
              관리자 콘솔
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              className="rounded-lg bg-gray-100 px-4 py-2 text-[#6D28D9]"
            >
              로그인
            </Button>
            <Button
              variant="secondary"
              className="rounded-lg bg-gray-100 px-4 py-2 text-[#6D28D9]"
            >
              회원가입
            </Button>
          </div>
        </nav>

        {/* Hero + Card Grid (interactive) */}
        <HomeInteractive />

        {/* Features */}
        <section
          data-section-type="features"
          className="flex flex-col items-center bg-white px-8 py-12 shadow-lg"
        >
          <div className="flex w-full max-w-[1000px] flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-[#4C1D95]">서비스 특징</h2>
            <p className="text-center text-[#6D28D9]">
              작가와 구매자 모두를 위한 안전한 결제·전달·관리 워크플로
            </p>

            <div className="mt-6 flex w-full gap-6">
              <div className="flex flex-1 flex-col items-start rounded-xl bg-[#FAF5FF] p-4">
                <div className="mb-3 h-10 w-10 rounded-lg bg-gray-200" />
                <h3 className="text-lg font-semibold text-[#4C1D95]">원클릭 작품 등록</h3>
                <p className="text-sm text-[#6D28D9]">
                  파일 업로드·가격 설정·태그 입력으로 2분 내 등록 완료
                </p>
              </div>
              <div className="flex flex-1 flex-col items-start rounded-xl bg-[#FAF5FF] p-4">
                <div className="mb-3 h-10 w-10 rounded-lg bg-gray-200" />
                <h3 className="text-lg font-semibold text-[#4C1D95]">안전한 결제·정산</h3>
                <p className="text-sm text-[#6D28D9]">다중 결제 수단과 자동 정산 리포트 제공</p>
              </div>
              <div className="flex flex-1 flex-col items-start rounded-xl bg-[#FAF5FF] p-4">
                <div className="mb-3 h-10 w-10 rounded-lg bg-gray-200" />
                <h3 className="text-lg font-semibold text-[#4C1D95]">파일 전달·버전 관리</h3>
                <p className="text-sm text-[#6D28D9]">
                  구매 후 파일 다운로드·교환 기록과 버전 히스토리 제공
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section
          data-section-type="stats"
          className="flex items-center justify-center bg-white px-8 py-10 shadow-lg"
        >
          <div className="flex w-full max-w-[900px] justify-between">
            <div className="flex flex-col items-center">
              <p className="text-3xl font-bold text-[#4C1D95]">+120</p>
              <p className="text-sm text-[#6D28D9]">주간 신규 아티스트 가입</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-3xl font-bold text-[#4C1D95]">+850</p>
              <p className="text-sm text-[#6D28D9]">주간 등록 작품 수</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-3xl font-bold text-[#4C1D95]">78%</p>
              <p className="text-sm text-[#6D28D9]">작품 등록 완료율</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-3xl font-bold text-[#4C1D95]">4.2%</p>
              <p className="text-sm text-[#6D28D9]">구매 전환율</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          data-section-type="cta"
          className="flex flex-col items-center justify-center bg-[#FAF5FF] px-8 py-12"
        >
          <div className="flex w-full max-w-[900px] flex-col items-center gap-4">
            <h2 className="text-center text-2xl font-bold text-[#4C1D95]">
              작가라면 지금 등록하고 첫 판매를 시작하세요
            </h2>
            <p className="text-center text-[#6D28D9]">
              간편한 등록 프로세스와 안전한 결제·전달 시스템으로 작품 판매를 지원합니다
            </p>

            <div className="flex w-full gap-4">
              <Button
                variant="outline"
                className="h-12 flex-1 rounded-lg border-[#DDD6FE] bg-white px-6 py-3 text-[#4C1D95] shadow-lg"
              >
                작품 등록하기
              </Button>
              <Button
                variant="outline"
                className="h-12 flex-1 rounded-lg border-[#DDD6FE] bg-white px-6 py-3 text-[#4C1D95] shadow-lg"
              >
                판매 가이드 보기
              </Button>
            </div>

            <div
              className="mt-6 w-full rounded-lg border border-[#DDD6FE] bg-white p-4 shadow-lg"
              data-component="card"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="font-semibold text-[#4C1D95]">주요 KPI</p>
                  <p className="text-sm text-[#6D28D9]">
                    성장·전환·운영·리텐션 지표를 대시보드에서 바로 확인
                  </p>
                </div>
                <div className="text-sm text-[#4C1D95]">대시보드 바로가기</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer data-section-type="footer" className="flex justify-between bg-white px-8 py-12">
          <div className="flex flex-col gap-2">
            <span className="text-lg font-bold text-gray-900">printtie</span>
            <p className="text-sm text-[#6D28D9]">© 2026 printtie. All rights reserved.</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[#6D28D9]">Company</p>
            <p className="text-sm text-[#6D28D9]">About</p>
            <p className="text-sm text-[#6D28D9]">Careers</p>
            <p className="text-sm text-[#6D28D9]">Contact</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[#6D28D9]">지원</p>
            <p className="text-sm text-[#6D28D9]">이용약관</p>
            <p className="text-sm text-[#6D28D9]">개인정보처리방침</p>
            <p className="text-sm text-[#6D28D9]">환불정책</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[#6D28D9]">작가용</p>
            <p className="text-sm text-[#6D28D9]">작품 등록 가이드</p>
            <p className="text-sm text-[#6D28D9]">정산 안내</p>
            <p className="text-sm text-[#6D28D9]">운영정책</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[#6D28D9]">구매자</p>
            <p className="text-sm text-[#6D28D9]">구매 가이드</p>
            <p className="text-sm text-[#6D28D9]">다운로드 정책</p>
            <p className="text-sm text-[#6D28D9]">문의하기</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
