'use client';

import { useRef } from 'react';
import type { SimulationResult, SimulationInput } from '@/lib/supabase';
import { INDUSTRY_LABELS, INDUSTRY_BENCHMARKS } from '@/lib/constants';

interface Props {
  result: SimulationResult;
  input: SimulationInput;
  onReset: () => void;
}

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
      windowWidth: 900,
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

    if (pdfHeight <= pageHeight) {
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, pdfHeight);
    } else {
      let position = 0;
      while (position < pdfHeight) {
        if (position > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, -position, pdfWidth, pdfHeight);
        position += pageHeight;
      }
    }

    pdf.save(`AIDP_ROI_${input.customerName || '시뮬레이션'}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const benchmark = INDUSTRY_BENCHMARKS[input.industry] || INDUSTRY_BENCHMARKS.service;
  const directCostMonthly = Math.round(result.totalCurrentHoursMonthly * (input.avgMonthlySalary / 174));

  return (
    <div className="space-y-6">
      <div ref={reportRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ maxWidth: 900 }}>
        {/* ======= Report Header ======= */}
        <div className="bg-gradient-to-r from-[#1B4F72] via-[#1E5A8A] to-[#2563EB] text-white p-6 md:p-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center font-bold">AI</div>
              <div>
                <p className="text-xs text-blue-200">위시켓 AIDP 심층 분석</p>
                <h2 className="text-xl font-bold">AI 도입 ROI 진단 리포트</h2>
              </div>
            </div>
            <div className="text-right text-xs text-blue-200">
              <p>{new Date().toLocaleDateString('ko-KR')} 작성</p>
              <p>v2.0 분석 엔진</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-blue-100">
            {input.customerName && <span>고객사: <strong className="text-white">{input.customerName}</strong></span>}
            <span>산업: <strong className="text-white">{INDUSTRY_LABELS[input.industry]}</strong></span>
            <span>규모: <strong className="text-white">{input.companySize}명</strong></span>
            <span>분석 업무: <strong className="text-white">{result.taskResults.length}개</strong></span>
            <span>관련 인원: <strong className="text-white">{result.totalCurrentPeople}명</strong></span>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* ======= Executive Summary ======= */}
          <div>
            <SectionTitle>핵심 요약 (Executive Summary)</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard
                label="월간 절감 시간"
                value={`${result.totalSavedHoursMonthly.toLocaleString()}`}
                unit="시간"
                sub={`총 ${result.totalCurrentHoursMonthly.toLocaleString()}시간 중`}
                color="#00B4D8"
              />
              <MetricCard
                label="연간 총 절감액"
                value={`${result.totalYearlySaving.toLocaleString()}`}
                unit="만원"
                sub={`월 ${result.totalMonthlySaving.toLocaleString()}만원`}
                color="#10B981"
              />
              <MetricCard
                label="투자수익률 (ROI)"
                value={`${result.moderateROI}`}
                unit="%"
                sub="첫 해 기준"
                color={result.moderateROI > 50 ? '#10B981' : result.moderateROI > 0 ? '#F59E0B' : '#EF4444'}
              />
              <MetricCard
                label="투자 회수 기간"
                value={`${result.paybackMonths}`}
                unit="개월"
                sub={`투자비 ${result.investmentCost.toLocaleString()}만원`}
                color="#8B5CF6"
              />
            </div>
          </div>

          {/* ======= Hidden Costs Discovery ======= */}
          {result.hiddenCosts.length > 0 && (
            <div>
              <SectionTitle color="#EF4444">발견된 숨은 비용</SectionTitle>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-5 border border-red-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <p className="text-sm font-bold text-red-700">
                      직접 비용 외 월 {result.totalHiddenMonthlyCost.toLocaleString()}만원의 숨은 비용 발견
                    </p>
                    <p className="text-xs text-red-500">
                      직접 인건비 {directCostMonthly.toLocaleString()}만원 + 숨은 비용 {result.totalHiddenMonthlyCost.toLocaleString()}만원 = 실제 총 비용 {(directCostMonthly + result.totalHiddenMonthlyCost).toLocaleString()}만원/월
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {result.hiddenCosts.map((hc, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border border-red-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{hc.icon}</span>
                        <p className="text-sm font-semibold text-gray-800">{hc.label}</p>
                        <span className="ml-auto text-sm font-bold text-red-600">
                          월 {hc.monthlyCost.toLocaleString()}만원
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{hc.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======= IT Consultant Analysis ======= */}
          {result.consultantAnalysis && (
            <div>
              <SectionTitle color="#8B5CF6">🧑‍💼 IT 컨설턴트 진단</SectionTitle>
              <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-xl border border-purple-100 overflow-hidden">
                {/* Summary Bar */}
                <div className="bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] p-4 flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-xl shrink-0">🧑‍💼</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-purple-100 mb-0.5">IT 컨설턴트 종합 의견</p>
                    <p className="text-white font-semibold text-sm leading-relaxed">{result.consultantAnalysis.summary}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${
                    result.consultantAnalysis.riskLevel === 'high'
                      ? 'bg-red-500/20 text-red-100 border border-red-400/30'
                      : result.consultantAnalysis.riskLevel === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30'
                      : 'bg-green-500/20 text-green-100 border border-green-400/30'
                  }`}>
                    {result.consultantAnalysis.riskLevel === 'high' ? '⚠️ 고위험' : result.consultantAnalysis.riskLevel === 'medium' ? '⚡ 중간 위험' : '✅ 안정'}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Insight Cards */}
                  <div className="grid md:grid-cols-2 gap-3">
                    {result.consultantAnalysis.insights.map((ins, i) => (
                      <div key={i} className={`bg-white rounded-lg p-4 border ${
                        ins.priority === 'critical' ? 'border-red-200 shadow-sm shadow-red-100' :
                        ins.priority === 'high' ? 'border-orange-200 shadow-sm shadow-orange-50' :
                        'border-gray-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{ins.icon}</span>
                          <p className="text-sm font-bold text-gray-800 flex-1">{ins.title}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                            ins.priority === 'critical' ? 'bg-red-100 text-red-600' :
                            ins.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {ins.priority === 'critical' ? '긴급' : ins.priority === 'high' ? '높음' : '보통'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{ins.body}</p>
                      </div>
                    ))}
                  </div>

                  {/* Detected Keywords & Focus */}
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 bg-white rounded-lg p-3 border border-gray-100">
                      <p className="text-xs text-gray-400 mb-2">감지된 핵심 키워드</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.consultantAnalysis.detectedKeywords.map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs font-medium rounded-full border border-purple-100">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 bg-white rounded-lg p-3 border border-gray-100">
                      <p className="text-xs text-gray-400 mb-2">추천 우선 집중 영역</p>
                      <p className="text-sm font-semibold text-[#8B5CF6]">{result.consultantAnalysis.recommendedFocus}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======= Pain Points Addressed ======= */}
          {result.addressedPainPoints.length > 0 && (
            <div>
              <SectionTitle>해결 가능한 고통 포인트 ({result.addressedPainPoints.length}건)</SectionTitle>
              <div className="grid md:grid-cols-2 gap-2">
                {result.addressedPainPoints.map((pp, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-green-500 text-sm">✓</span>
                    <p className="text-sm text-green-800">{pp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======= Task Breakdown ======= */}
          <div>
            <SectionTitle>업무별 자동화 분석</SectionTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 text-gray-500 font-semibold">업무</th>
                    <th className="text-center p-3 text-gray-500 font-semibold">인원</th>
                    <th className="text-center p-3 text-gray-500 font-semibold">현재 시간/월</th>
                    <th className="text-center p-3 text-gray-500 font-semibold">자동화율</th>
                    <th className="text-center p-3 text-gray-500 font-semibold">절감 시간</th>
                    <th className="text-right p-3 text-gray-500 font-semibold">절감액/월</th>
                  </tr>
                </thead>
                <tbody>
                  {result.taskResults.map((tr, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="p-3">
                        <p className="font-medium text-gray-800">{tr.label}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          tr.feasibility === 'high' ? 'bg-green-50 text-green-600' :
                          tr.feasibility === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-gray-50 text-gray-500'
                        }`}>
                          {tr.feasibility === 'high' ? '즉시 가능' : tr.feasibility === 'medium' ? '단계적' : '장기'}
                        </span>
                      </td>
                      <td className="text-center p-3 text-gray-600">{tr.currentPeople}명</td>
                      <td className="text-center p-3 text-gray-600">{tr.currentHoursMonthly}h</td>
                      <td className="text-center p-3">
                        <div className="inline-flex items-center gap-1">
                          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${tr.automationRate * 100}%`,
                                backgroundColor: tr.automationRate >= 0.7 ? '#10B981' : tr.automationRate >= 0.5 ? '#F59E0B' : '#94A3B8',
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-600">{Math.round(tr.automationRate * 100)}%</span>
                        </div>
                      </td>
                      <td className="text-center p-3 font-semibold text-[#00B4D8]">{tr.savedHoursMonthly}h</td>
                      <td className="text-right p-3 font-bold text-[#10B981]">{tr.savedCostMonthly.toLocaleString()}만원</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#F0F9FF]">
                    <td className="p-3 font-bold text-[#1B4F72]">합계</td>
                    <td className="text-center p-3 font-bold text-[#1B4F72]">{result.totalCurrentPeople}명</td>
                    <td className="text-center p-3 font-bold text-[#1B4F72]">{result.totalCurrentHoursMonthly}h</td>
                    <td className="p-3"></td>
                    <td className="text-center p-3 font-bold text-[#00B4D8]">{result.totalSavedHoursMonthly}h</td>
                    <td className="text-right p-3 font-bold text-[#10B981]">{result.directMonthlySaving.toLocaleString()}만원</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ======= ROI Scenarios ======= */}
          <div>
            <SectionTitle>ROI 시나리오 분석</SectionTitle>
            <div className="grid md:grid-cols-3 gap-4">
              <ScenarioCard
                title="보수적"
                roi={result.conservativeROI}
                saving={Math.round(result.totalYearlySaving * 0.7)}
                desc="70% 성과 달성 가정"
                color="#94A3B8"
                bg="bg-gray-50"
              />
              <ScenarioCard
                title="기본"
                roi={result.moderateROI}
                saving={result.totalYearlySaving}
                desc="벤치마크 기준 달성"
                color="#00B4D8"
                bg="bg-[#F0F9FF]"
                highlighted
              />
              <ScenarioCard
                title="낙관적"
                roi={result.optimisticROI}
                saving={Math.round(result.totalYearlySaving * 1.3)}
                desc="130% 성과 달성 가정"
                color="#10B981"
                bg="bg-green-50"
              />
            </div>
          </div>

          {/* ======= 3-Year Projection ======= */}
          <div>
            <SectionTitle>3개년 투자 수익 전망</SectionTitle>
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="space-y-4">
                {result.yearProjections.map(yp => {
                  const maxVal = Math.max(...result.yearProjections.map(y => y.cumulativeSaving));
                  return (
                    <div key={yp.year}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-700">{yp.year}년차</span>
                        <div className="text-right">
                          <span className={`text-sm font-bold ${yp.netBenefit > 0 ? 'text-[#10B981]' : 'text-red-500'}`}>
                            {yp.netBenefit > 0 ? '+' : ''}{yp.netBenefit.toLocaleString()}만원
                          </span>
                          <span className="text-xs text-gray-400 ml-2">ROI {yp.roi}%</span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-7">
                        <div
                          className="bg-[#00B4D8] rounded-l-md flex items-center justify-end pr-2 transition-all"
                          style={{ width: `${(yp.cumulativeSaving / maxVal) * 100}%`, minWidth: 40 }}
                        >
                          <span className="text-xs text-white font-semibold">{yp.cumulativeSaving.toLocaleString()}</span>
                        </div>
                        <div
                          className="bg-red-400 rounded-r-md flex items-center pl-2"
                          style={{ width: `${(yp.cumulativeInvestment / maxVal) * 100}%`, minWidth: 40 }}
                        >
                          <span className="text-xs text-white font-semibold">-{yp.cumulativeInvestment.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#00B4D8] rounded" /> 누적 절감액</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded" /> 누적 투자비</span>
                <span className="ml-auto font-semibold text-[#1B4F72]">3년 NPV: {result.npv.toLocaleString()}만원</span>
              </div>
            </div>
          </div>

          {/* ======= Cost of Inaction ======= */}
          <div>
            <SectionTitle color="#EF4444">도입하지 않을 경우의 비용 (Cost of Inaction)</SectionTitle>
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-5 border border-red-200">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📉</div>
                <div>
                  <p className="text-2xl font-black text-red-700">
                    3년간 {(result.costOfInaction3Year / 10000).toFixed(1)}억원
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    현재 수작업을 유지할 경우, 직접 비용 + 숨은 비용으로 3년간 총 {result.costOfInaction3Year.toLocaleString()}만원이 지속적으로 발생합니다.
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    * 연간 5% 비용 상승률 반영 (인건비 인상, 인플레이션)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ======= Quick Wins ======= */}
          {result.quickWins.length > 0 && (
            <div>
              <SectionTitle color="#10B981">즉시 시작 가능한 영역 (Quick Wins)</SectionTitle>
              <div className="space-y-2">
                {result.quickWins.map((qw, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-7 h-7 bg-green-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </div>
                    <p className="text-sm text-green-800 font-medium">{qw}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======= Implementation Roadmap ======= */}
          <div>
            <SectionTitle>권장 도입 로드맵</SectionTitle>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              {[
                {
                  phase: 'Phase 1',
                  title: 'Quick Win 자동화',
                  period: '1~2개월',
                  desc: '자동화 가능성 높은 업무부터 즉시 도입하여 빠른 성과 확인',
                  color: '#10B981',
                },
                {
                  phase: 'Phase 2',
                  title: '핵심 프로세스 자동화',
                  period: `3~${result.implementationMonths}개월`,
                  desc: '중간 난이도 업무의 AI 자동화 구축 및 시스템 연동',
                  color: '#00B4D8',
                },
                {
                  phase: 'Phase 3',
                  title: '고도화 및 확장',
                  period: `${result.implementationMonths + 1}~${result.implementationMonths + 3}개월`,
                  desc: 'AI 기반 예측, 의사결정 지원 등 고부가가치 영역 확장',
                  color: '#8B5CF6',
                },
              ].map((phase, i) => (
                <div key={i} className="relative pl-10 pb-6">
                  <div
                    className="absolute left-2 w-5 h-5 rounded-full border-2 border-white"
                    style={{ backgroundColor: phase.color, top: 2 }}
                  />
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: phase.color }}>
                        {phase.phase}
                      </span>
                      <span className="text-xs text-gray-400">{phase.period}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{phase.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{phase.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ======= Case Studies ======= */}
          {result.matchedCases.length > 0 && (
            <div>
              <SectionTitle>유사 성공 사례</SectionTitle>
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
                        <p className="font-bold text-[#1B4F72]">{cs.before_hours_monthly}h → {cs.after_hours_monthly}h</p>
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

          {/* ======= Industry Benchmark ======= */}
          <div>
            <SectionTitle>업계 벤치마크</SectionTitle>
            <div className="bg-[#F0F9FF] rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">업계 평균 자동화율</p>
                <p className="text-xl font-bold text-[#1B4F72]">{Math.round(benchmark.avgAutomationRate * 100)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">AI 도입 기업 비율</p>
                <p className="text-xl font-bold text-[#00B4D8]">{benchmark.industryAdoptionRate}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">평균 프로젝트 비용</p>
                <p className="text-xl font-bold text-[#1B4F72]">
                  {(benchmark.projectCostRange[0] / 1000).toFixed(0)}~{(benchmark.projectCostRange[1] / 1000).toFixed(0)}천만원
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">평균 구축 기간</p>
                <p className="text-xl font-bold text-[#1B4F72]">
                  {benchmark.implementationMonths[0]}~{benchmark.implementationMonths[1]}개월
                </p>
              </div>
            </div>
          </div>

          {/* ======= CTA ======= */}
          <div className="bg-gradient-to-r from-[#1B4F72] to-[#2563EB] rounded-xl p-6 text-white text-center">
            <h3 className="text-lg font-bold mb-2">AI 도입, 더 구체적으로 상담받으세요</h3>
            <p className="text-sm text-blue-200 mb-4">
              위시켓 AIDP 전문 컨설턴트가 귀사에 맞는 최적의 AI 도입 전략을 설계해드립니다.
            </p>
            <a
              href="https://www.wishket.com/aidp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-[#1B4F72] font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition"
            >
              무료 상담 신청하기 →
            </a>
          </div>

          {/* ======= Footer ======= */}
          <div className="pt-6 border-t border-gray-100 text-center space-y-1">
            <p className="text-xs text-gray-400">
              본 분석은 보수적 추정 기반이며 실제 성과는 고객 환경에 따라 달라질 수 있습니다.
            </p>
            <p className="text-xs text-gray-400">
              Confidential — {input.customerName || '고객사'} 전용 리포트 · 위시켓 AIDP · {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownloadPDF}
          className="flex-1 py-4 bg-[#1B4F72] hover:bg-[#163D5A] text-white rounded-xl font-semibold text-base transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDF 리포트 다운로드
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

// ====== Sub Components ======

function SectionTitle({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <h3
      className="text-sm font-bold mb-4 uppercase tracking-wider"
      style={{ color: color || '#1B4F72' }}
    >
      {children}
    </h3>
  );
}

function MetricCard({ label, value, unit, sub, color }: {
  label: string; value: string; unit: string; sub: string; color: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black" style={{ color }}>{value}</span>
        <span className="text-sm font-semibold" style={{ color }}>{unit}</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function ScenarioCard({ title, roi, saving, desc, color, bg, highlighted }: {
  title: string; roi: number; saving: number; desc: string; color: string; bg: string; highlighted?: boolean;
}) {
  return (
    <div className={`${bg} rounded-xl p-5 ${highlighted ? 'border-2 border-[#00B4D8] shadow-md shadow-[#00B4D8]/10' : 'border border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <p className="text-sm font-bold" style={{ color }}>{title} 시나리오</p>
        {highlighted && <span className="text-xs bg-[#00B4D8] text-white px-2 py-0.5 rounded-full ml-auto">추천</span>}
      </div>
      <p className="text-3xl font-black" style={{ color }}>{roi}%</p>
      <p className="text-xs text-gray-500 mt-1">연간 {saving.toLocaleString()}만원 절감</p>
      <p className="text-xs text-gray-400">{desc}</p>
    </div>
  );
}
