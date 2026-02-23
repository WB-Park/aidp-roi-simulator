'use client';

import { useState } from 'react';
import { calculateROI } from '@/lib/roi-calculator';
import type { SimulationInput, SimulationResult } from '@/lib/supabase';
import type { CaseStudy } from '@/lib/supabase';
import ResultsView from '@/components/ResultsView';

const INDUSTRIES = [
  { value: 'manufacturing', label: '제조업' },
  { value: 'retail', label: '유통업' },
  { value: 'service', label: '서비스업' },
  { value: 'other', label: '기타' },
];

const COMPANY_SIZES = [
  { value: '30-100', label: '30~100명' },
  { value: '100-500', label: '100~500명' },
  { value: '500+', label: '500명 이상' },
];

const AI_AREAS = [
  { value: '데이터정제', label: '데이터 정제/분석' },
  { value: '프로세스자동화', label: '프로세스 자동화' },
  { value: '고객응대', label: '고객 응대 자동화' },
  { value: '재고예측', label: '재고/수요 예측' },
  { value: '기타', label: '기타' },
];

export default function Home() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const [input, setInput] = useState<SimulationInput>({
    customerName: '',
    industry: '',
    companySize: '',
    currentHoursMonthly: 0,
    currentCostMonthly: 0,
    aiArea: '',
  });

  const canProceedStep1 = input.industry && input.companySize;
  const canProceedStep2 = input.currentHoursMonthly > 0 && input.currentCostMonthly > 0 && input.aiArea;

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await calculateROI(input);
      setResult(res);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert('계산 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setResult(null);
    setInput({
      customerName: '',
      industry: '',
      companySize: '',
      currentHoursMonthly: 0,
      currentCostMonthly: 0,
      aiArea: '',
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-[#1B4F72] text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00B4D8] rounded-lg flex items-center justify-center font-bold text-sm">AI</div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">AIDP ROI 시뮬레이터</h1>
              <p className="text-xs text-blue-200 opacity-80">위시켓 AI Delivery Platform</p>
            </div>
          </div>
          {step === 3 && (
            <button onClick={handleReset} className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition">
              새 시뮬레이션
            </button>
          )}
        </div>
      </header>

      {/* Progress Bar */}
      {step < 3 && (
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step >= s ? 'bg-[#00B4D8] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s ? '✓' : s}
                </div>
                <span className={`text-sm ${step >= s ? 'text-[#1B4F72] font-medium' : 'text-gray-400'}`}>
                  {s === 1 ? '산업/규모 선택' : '현황 입력'}
                </span>
                {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-[#00B4D8]' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 pb-12">
        {/* Step 1: 산업/규모 선택 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-[#1B4F72] mb-1">고객 기업 정보</h2>
            <p className="text-sm text-gray-500 mb-6">산업과 기업 규모를 선택해주세요.</p>

            <div className="space-y-6">
              {/* 산업 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">산업 분류</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {INDUSTRIES.map((ind) => (
                    <button
                      key={ind.value}
                      onClick={() => setInput({ ...input, industry: ind.value })}
                      className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                        input.industry === ind.value
                          ? 'border-[#00B4D8] bg-[#00B4D8]/5 text-[#00B4D8]'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {ind.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 기업 규모 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">기업 규모 (직원 수)</label>
                <div className="grid grid-cols-3 gap-3">
                  {COMPANY_SIZES.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setInput({ ...input, companySize: size.value })}
                      className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                        input.companySize === size.value
                          ? 'border-[#00B4D8] bg-[#00B4D8]/5 text-[#00B4D8]'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className={`w-full py-4 rounded-xl text-white font-semibold text-base transition-all ${
                  canProceedStep1
                    ? 'bg-[#00B4D8] hover:bg-[#0096B7] shadow-lg shadow-[#00B4D8]/20'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                다음 단계 →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 수치 입력 */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#1B4F72] mb-1">현재 업무 현황</h2>
                <p className="text-sm text-gray-500">AI 도입 대상 업무의 현재 수치를 입력해주세요.</p>
              </div>
              <button onClick={() => setStep(1)} className="text-sm text-[#00B4D8] hover:underline">← 이전</button>
            </div>

            <div className="space-y-5">
              {/* 고객사명 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">고객사명 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 삼성전자"
                  value={input.customerName}
                  onChange={(e) => setInput({ ...input, customerName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition text-sm"
                />
              </div>

              {/* 수작업 시간 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">월간 수작업 시간 (시간)</label>
                <input
                  type="number"
                  placeholder="예: 160"
                  value={input.currentHoursMonthly || ''}
                  onChange={(e) => setInput({ ...input, currentHoursMonthly: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">AI 도입 대상 업무에 소요되는 월간 총 시간</p>
              </div>

              {/* 수작업 비용 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">월간 수작업 비용 (만원)</label>
                <input
                  type="number"
                  placeholder="예: 1200"
                  value={input.currentCostMonthly || ''}
                  onChange={(e) => setInput({ ...input, currentCostMonthly: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">해당 업무 관련 인건비, 운영비 등 총 비용</p>
              </div>

              {/* AI 도입 영역 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">AI 도입 목표 영역</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AI_AREAS.map((area) => (
                    <button
                      key={area.value}
                      onClick={() => setInput({ ...input, aiArea: area.value })}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        input.aiArea === area.value
                          ? 'border-[#00B4D8] bg-[#00B4D8]/5 text-[#00B4D8]'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {area.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCalculate}
                disabled={!canProceedStep2 || loading}
                className={`w-full py-4 rounded-xl text-white font-semibold text-base transition-all ${
                  canProceedStep2 && !loading
                    ? 'bg-[#00B4D8] hover:bg-[#0096B7] shadow-lg shadow-[#00B4D8]/20'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    분석 중...
                  </span>
                ) : (
                  'ROI 확인하기'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 결과 */}
        {step === 3 && result && (
          <ResultsView result={result} input={input} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}
