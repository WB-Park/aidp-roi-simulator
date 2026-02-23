'use client';

import { useRef } from 'react';
import type { SimulationResult, SimulationInput } from '@/lib/supabase';

interface Props {
  result: SimulationResult;
  input: SimulationInput;
  onReset: () => void;
}

const INDUSTRY_LABELS: Record<string, string> = {
  manufacturing: '제조업',
  retail: '유통업',
  service: '서비스업',
  other: '기타',
};

export default function ResultsView({ result, input, onReset }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`AIDP_ROI_${input.customerName || '시뮬레이션'}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const beforeHours = input.currentHoursMonthly;
  const afterHours = beforeHours - result.hoursSaved;
  const beforeCost = input.currentCostMonthly;
  const afterCost = beforeCost - result.monthlySaving;
  const barMaxHours = beforeHours;
  const barMaxCost = beforeCost;

  return (
    <div className="space-y-6">
      {/* Report Content (for PDF capture) */}
      <div ref={reportRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Report Header */}
        <div className="bg-gradient-to-r from-[#1B4F72] to-[#2C6FA0] text-white p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#00B4D8] rounded-lg flex items-center justify-center font-bold text-sm">AI</div>
            <div>
              <p className="text-xs text-blue-200">위시켓 AIDP</p>
              <h2 className="text-lg font-bold">AI 도입 ROI 분석 리포트</h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-blue-100">
            {input.customerName && <span>고객사: <strong className="text-white">{input.customerName}</strong></span>}
            <span>산업: <strong className="text-white">{INDUSTRY_LABELS[input.industry]}</strong></span>
            <span>분석일: <strong className="text-white">{new Date().toLocaleDateString('ko-KR')}</strong></span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <SummaryCard
              label="월간 시간 절감"
              value={`${result.hoursSaved}시간`}
              sub={`월 ${beforeHours}h → ${afterHours}h`}
              color="#00B4D8"
            />
            <SummaryCard
              label="연간 비용 절감"
              value={`${result.yearlySaving.toLocaleString()}만원`}
              sub={`월 ${result.monthlySaving.toLocaleString()}만원 절감`}
              color="#10B981"
            />
            <SummaryCard
              label="투자 수익률"
              value={`${result.roi}%`}
              sub="첫 해 기준 (보수적)"
              color={result.roi > 0 ? '#10B981' : '#EF4444'}
            />
            <SummaryCard
              label="투자 회수 기간"
              value={`${result.paybackMonths}개월`}
              sub={`투자비 ${result.investmentCost.toLocaleString()}만원`}
              color="#F59E0B"
            />
          </div>

          {/* Before/After Charts */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-[#1B4F72] mb-4 uppercase tracking-wider">Before / After 비교</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* 시간 비교 */}
              <div className="bg-gray-50 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-600 mb-4">월간 업무 시간</p>
                <div className="space-y-3">
                  <BarItem label="현재" value={beforeHours} max={barMaxHours} color="#EF4444" unit="시간" />
                  <BarItem label="도입 후" value={afterHours} max={barMaxHours} color="#00B4D8" unit="시간" />
                </div>
                <p className="text-xs text-green-600 font-semibold mt-3">
                  ▼ {result.hoursSaved}시간 절감 ({Math.round((result.hoursSaved / beforeHours) * 100)}%)
                </p>
              </div>

              {/* 비용 비교 */}
              <div className="bg-gray-50 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-600 mb-4">월간 운영 비용</p>
                <div className="space-y-3">
                  <BarItem label="현재" value={beforeCost} max={barMaxCost} color="#EF4444" unit="만원" />
                  <BarItem label="도입 후" value={afterCost} max={barMaxCost} color="#00B4D8" unit="만원" />
                </div>
                <p className="text-xs text-green-600 font-semibold mt-3">
                  ▼ {result.monthlySaving.toLocaleString()}만원/월 절감 ({Math.round((result.monthlySaving / beforeCost) * 100)}%)
                </p>
              </div>
            </div>
          </div>

          {/* ROI Gauge */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-[#1B4F72] mb-4 uppercase tracking-wider">ROI 게이지</h3>
            <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center">
              <ROIGauge value={result.roi} />
              <p className="text-sm text-gray-500 mt-2">
                {result.roi > 100 ? '높은 투자 수익률' : result.roi > 0 ? '양호한 투자 수익률' : '투자 회수에 시간 필요'}
              </p>
            </div>
          </div>

          {/* 성공 사례 */}
          {result.matchedCases.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-[#1B4F72] mb-4 uppercase tracking-wider">유사 성공 사례</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {result.matchedCases.map((cs) => (
                  <div key={cs.id} className="border border-gray-200 rounded-xl p-5 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-[#00B4D8]/10 text-[#00B4D8] text-xs font-semibold rounded-full">
                        {INDUSTRY_LABELS[cs.industry]}
                      </span>
                      <h4 className="font-bold text-[#1B4F72]">{cs.company_name}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-gray-500 text-xs">시간 절감</p>
                        <p className="font-bold text-[#1B4F72]">
                          {cs.before_hours_monthly}h → {cs.after_hours_monthly}h
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-gray-500 text-xs">프로젝트 비용</p>
                        <p className="font-bold text-[#1B4F72]">{cs.project_cost?.toLocaleString()}만원</p>
                      </div>
                    </div>
                    {cs.testimonial && (
                      <p className="text-xs text-gray-500 italic border-l-2 border-[#00B4D8] pl-3">
                        &ldquo;{cs.testimonial}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              본 분석은 보수적 추정 기반이며 실제 성과는 고객 환경에 따라 달라질 수 있습니다.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              위시켓 AIDP | AI Delivery Platform | aidp.wishket.com
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons (not captured in PDF) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownloadPDF}
          className="flex-1 py-4 bg-[#1B4F72] hover:bg-[#163D5A] text-white rounded-xl font-semibold text-base transition-all shadow-lg"
        >
          PDF 다운로드
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-4 bg-white border-2 border-[#00B4D8] text-[#00B4D8] hover:bg-[#00B4D8]/5 rounded-xl font-semibold text-base transition-all"
        >
          새 시뮬레이션
        </button>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function BarItem({ label, value, max, color, unit }: { label: string; value: number; max: number; color: string; unit: string }) {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-14 text-right">{label}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
          style={{ width: `${Math.max(percent, 8)}%`, backgroundColor: color }}
        >
          <span className="text-xs text-white font-semibold">{value.toLocaleString()}{unit}</span>
        </div>
      </div>
    </div>
  );
}

function ROIGauge({ value }: { value: number }) {
  // Clamp value between -100 and 500 for display
  const displayVal = Math.max(-100, Math.min(500, value));
  // Map to 0-180 degrees
  const angle = ((displayVal + 100) / 600) * 180;
  const radians = (angle * Math.PI) / 180;
  const x = 100 + 80 * Math.cos(Math.PI - radians);
  const y = 100 - 80 * Math.sin(Math.PI - radians);

  return (
    <svg viewBox="0 0 200 120" className="w-48 h-auto">
      {/* Background arc */}
      <path
        d="M 20 100 A 80 80 0 0 1 180 100"
        fill="none"
        stroke="#E5E7EB"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Colored arc segments */}
      <path d="M 20 100 A 80 80 0 0 1 60 35" fill="none" stroke="#EF4444" strokeWidth="12" strokeLinecap="round" />
      <path d="M 60 35 A 80 80 0 0 1 100 20" fill="none" stroke="#F59E0B" strokeWidth="12" />
      <path d="M 100 20 A 80 80 0 0 1 140 35" fill="none" stroke="#10B981" strokeWidth="12" />
      <path d="M 140 35 A 80 80 0 0 1 180 100" fill="none" stroke="#059669" strokeWidth="12" strokeLinecap="round" />
      {/* Needle */}
      <line x1="100" y1="100" x2={x} y2={y} stroke="#1B4F72" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="100" r="5" fill="#1B4F72" />
      {/* Value */}
      <text x="100" y="90" textAnchor="middle" className="text-2xl font-bold" fill="#1B4F72" fontSize="22">
        {value}%
      </text>
      <text x="100" y="108" textAnchor="middle" fill="#64748B" fontSize="9">
        ROI
      </text>
    </svg>
  );
}
