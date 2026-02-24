'use client';

import { useState, useMemo, useEffect } from 'react';
import { calculateROI } from '@/lib/roi-calculator';
import type { SimulationInput, SimulationResult, TaskInput } from '@/lib/supabase';
import {
  INDUSTRIES, COMPANY_SIZES, REVENUE_RANGES, URGENCY_LEVELS,
  PAIN_POINTS, TASK_TEMPLATES, DEFAULT_SALARY, INDUSTRY_LABELS,
} from '@/lib/constants';
import ResultsView from '@/components/ResultsView';

const STEPS = [
  { num: 1, label: '기업 프로필' },
  { num: 2, label: '현황 진단' },
  { num: 3, label: '비용 구조' },
];

export default function Home() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState<SimulationResult | null>(null);

  const [input, setInput] = useState<SimulationInput>({
    customerName: '',
    industry: '',
    companySize: '',
    annualRevenue: '',
    urgencyLevel: 'planning',
    freeText: '',
    painPoints: [],
    tasks: [],
    avgMonthlySalary: 350,
    errorRate: 5,
    complianceRisk: false,
  });

  // --- Step 1에서 산업 선택 시 tasks 자동 세팅 ---
  const setIndustry = (val: string) => {
    const templates = TASK_TEMPLATES[val] || [];
    const tasks: TaskInput[] = templates.map(t => ({
      id: t.id,
      category: t.category,
      label: t.label,
      peopleCount: t.defaultPeople,
      hoursPerPersonWeek: t.defaultHoursPerWeek,
      enabled: true,
      automationRate: t.automationRate,
      feasibility: t.feasibility,
    }));
    setInput(prev => ({
      ...prev,
      industry: val,
      tasks,
      painPoints: [],
      avgMonthlySalary: DEFAULT_SALARY[val] || 350,
    }));
  };

  // --- Validation ---
  const canStep1 = input.industry && input.companySize && input.annualRevenue;
  const canStep2 = input.painPoints.length > 0 && input.tasks.some(t => t.enabled);
  const canStep3 = input.avgMonthlySalary > 0;

  // --- Live preview calculation ---
  const liveStats = useMemo(() => {
    const enabled = input.tasks.filter(t => t.enabled && t.peopleCount > 0 && t.hoursPerPersonWeek > 0);
    const totalHours = enabled.reduce((s, t) => s + t.peopleCount * t.hoursPerPersonWeek * 4.33, 0);
    const totalPeople = enabled.reduce((s, t) => s + t.peopleCount, 0);
    return { totalHours: Math.round(totalHours), totalPeople, taskCount: enabled.length };
  }, [input.tasks]);

  // --- Pain point toggle ---
  const togglePain = (id: string) => {
    setInput(prev => ({
      ...prev,
      painPoints: prev.painPoints.includes(id)
        ? prev.painPoints.filter(p => p !== id)
        : [...prev.painPoints, id],
    }));
  };

  // --- Task field update ---
  const updateTask = (id: string, field: 'peopleCount' | 'hoursPerPersonWeek' | 'enabled', value: number | boolean) => {
    setInput(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, [field]: value } : t),
    }));
  };

  // --- Calculate ---
  const handleCalculate = async () => {
    setLoading(true);
    const messages = ['업무 데이터 분석 중...', '숨은 비용 산출 중...', '3개년 시나리오 계산 중...', 'ROI 리포트 생성 중...'];
    let i = 0;
    setLoadingMsg(messages[0]);
    const timer = setInterval(() => {
      i = Math.min(i + 1, messages.length - 1);
      setLoadingMsg(messages[i]);
    }, 800);

    try {
      const res = await calculateROI(input);
      setResult(res);
      setStep(4);
    } catch (err) {
      console.error(err);
      alert('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setResult(null);
    setInput({
      customerName: '', industry: '', companySize: '', annualRevenue: '',
      urgencyLevel: 'planning', freeText: '', painPoints: [], tasks: [],
      avgMonthlySalary: 350, errorRate: 5, complianceRisk: false,
    });
    try { localStorage.removeItem('aidp_draft'); } catch {}
  };

  // #6: Auto-save to localStorage
  useEffect(() => {
    if (input.industry) {
      try { localStorage.setItem('aidp_draft', JSON.stringify({ step, input })); } catch {}
    }
  }, [step, input]);

  // #6: Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aidp_draft');
      if (saved) {
        const { step: s, input: inp } = JSON.parse(saved);
        if (inp?.industry && s < 4) { setInput(inp); setStep(s); }
      }
    } catch {}
  }, []);

  const industryPains = PAIN_POINTS[input.industry] || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header — sticky */}
      <header className="bg-gradient-to-r from-[#1B4F72] to-[#2563EB] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center font-bold text-sm">AI</div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">AIDP ROI 시뮬레이터</h1>
              <p className="text-xs text-blue-200 opacity-80">위시켓 AI Delivery Platform · v2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {step < 4 && step > 1 && (
              <span className="text-xs text-blue-200 hidden sm:block">진행률 {Math.round(((step - 1) / 3) * 100)}%</span>
            )}
            {step === 4 && (
              <button onClick={handleReset} className="text-sm bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg transition backdrop-blur">
                새 시뮬레이션
              </button>
            )}
          </div>
        </div>
        {/* Progress bar under header */}
        {step < 4 && (
          <div className="h-1 bg-white/10">
            <div
              className="h-full bg-[#00B4D8] transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        )}
      </header>

      {/* Progress Bar */}
      {step < 4 && (
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <div className="flex items-center gap-1 mb-6">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step > s.num ? 'bg-[#10B981] text-white' :
                    step === s.num ? 'bg-[#00B4D8] text-white shadow-lg shadow-[#00B4D8]/30' :
                    'bg-gray-200 text-gray-400'
                  }`}>
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span className={`text-sm hidden sm:block ${
                    step >= s.num ? 'text-[#1B4F72] font-semibold' : 'text-gray-400'
                  }`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 rounded ${step > s.num ? 'bg-[#10B981]' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 pb-16">
        {/* ====== STEP 1: 기업 프로필 ====== */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-[#1B4F72] mb-1">기업 프로필</h2>
              <p className="text-sm text-gray-500 mb-6">정확한 진단을 위해 기업 정보를 선택해주세요.</p>

              {/* 고객사명 */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">고객사명 <span className="text-gray-400 font-normal">(선택)</span></label>
                <input
                  type="text"
                  placeholder="예: 삼성전자"
                  value={input.customerName}
                  onChange={e => setInput({ ...input, customerName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition text-sm"
                />
              </div>

              {/* 산업 선택 */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">산업 분류</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {INDUSTRIES.map(ind => (
                    <button
                      key={ind.value}
                      onClick={() => setIndustry(ind.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        input.industry === ind.value
                          ? 'border-[#00B4D8] bg-[#00B4D8]/5 shadow-md shadow-[#00B4D8]/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{ind.icon}</span>
                      <p className={`text-sm font-semibold mt-1 ${input.industry === ind.value ? 'text-[#00B4D8]' : 'text-gray-700'}`}>
                        {ind.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{ind.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 기업 규모 */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">기업 규모 (직원 수)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {COMPANY_SIZES.map(size => (
                    <button
                      key={size.value}
                      onClick={() => setInput({ ...input, companySize: size.value })}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        input.companySize === size.value
                          ? 'border-[#00B4D8] bg-[#00B4D8]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className={`text-sm font-semibold ${input.companySize === size.value ? 'text-[#00B4D8]' : 'text-gray-700'}`}>
                        {size.label}
                      </p>
                      <p className="text-xs text-gray-400">{size.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 연매출 */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">연 매출 규모</label>
                <div className="flex flex-wrap gap-2">
                  {REVENUE_RANGES.map(rev => (
                    <button
                      key={rev.value}
                      onClick={() => setInput({ ...input, annualRevenue: rev.value })}
                      className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                        input.annualRevenue === rev.value
                          ? 'border-[#00B4D8] bg-[#00B4D8]/5 text-[#00B4D8] font-semibold'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {rev.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 시급도 */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">AI 도입 시급도</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {URGENCY_LEVELS.map(u => (
                    <button
                      key={u.value}
                      onClick={() => setInput({ ...input, urgencyLevel: u.value })}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        input.urgencyLevel === u.value
                          ? 'border-[#00B4D8] bg-[#00B4D8]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: u.color }} />
                      <p className={`text-sm font-semibold ${input.urgencyLevel === u.value ? 'text-[#00B4D8]' : 'text-gray-600'}`}>
                        {u.label}
                      </p>
                      <p className="text-xs text-gray-400">{u.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 자유 텍스트 입력 */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  우리 회사 상황 <span className="text-gray-400 font-normal">(선택)</span>
                </label>
                <p className="text-xs text-gray-400 mb-3">현재 겪고 계신 어려움이나 자동화하고 싶은 업무를 자유롭게 적어주세요. AI 컨설턴트가 분석하여 맞춤 진단을 제공합니다.</p>
                <textarea
                  rows={4}
                  placeholder="예: 매달 엑셀로 재고 정리하는데 3명이 일주일씩 매달려요. 베테랑 직원이 퇴사하면 업무가 마비되고, 수기로 하다 보니 실수도 잦습니다. 보고서 만드는 데만 매주 이틀은 걸리는 것 같아요..."
                  value={input.freeText}
                  onChange={e => setInput({ ...input, freeText: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition text-sm resize-none placeholder:text-gray-300"
                />
                {input.freeText.length > 0 && (
                  <p className="text-xs text-[#00B4D8] mt-1.5 flex items-center gap-1">
                    <span>🤖</span> IT 컨설턴트가 입력 내용을 기반으로 맞춤 분석을 제공합니다
                  </p>
                )}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!canStep1}
                className={`w-full py-4 rounded-xl text-white font-semibold text-base transition-all ${
                  canStep1 ? 'bg-[#00B4D8] hover:bg-[#0096B7] shadow-lg shadow-[#00B4D8]/20' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                현황 진단하기 →
              </button>
            </div>
          </div>
        )}

        {/* ====== STEP 2: 현황 진단 ====== */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeInUp">
            {/* Pain Points */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-[#1B4F72]">현재 겪고 계신 고통은?</h2>
                <button onClick={() => setStep(1)} className="text-sm text-[#00B4D8] hover:underline">← 이전</button>
              </div>
              <p className="text-sm text-gray-500 mb-5">해당되는 항목을 모두 선택해주세요. <span className="text-[#00B4D8] font-semibold">{input.painPoints.length}개 선택됨</span></p>

              <div className="grid gap-2 md:grid-cols-2">
                {industryPains.map(pain => {
                  const isSelected = input.painPoints.includes(pain.id);
                  return (
                    <button
                      key={pain.id}
                      onClick={() => togglePain(pain.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-[#00B4D8] bg-[#00B4D8]/5'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-xs ${
                        isSelected ? 'bg-[#00B4D8] text-white' : 'bg-gray-100'
                      }`}>
                        {isSelected && '✓'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${isSelected ? 'text-[#1B4F72] font-semibold' : 'text-gray-600'}`}>
                          {pain.label}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                        pain.impact === 'high' ? 'bg-red-50 text-red-500' :
                        pain.impact === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {pain.impact === 'high' ? '영향 큼' : pain.impact === 'medium' ? '중간' : '낮음'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Task Breakdown Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-[#1B4F72] mb-1">AI 자동화 대상 업무</h2>
              <p className="text-sm text-gray-500 mb-5">
                {INDUSTRY_LABELS[input.industry]} 기준으로 자동 세팅되었습니다. 인원과 시간을 조정해주세요.
              </p>

              {/* Live Stats Bar */}
              <div className="bg-gradient-to-r from-[#F0F9FF] to-[#F0FDF4] rounded-xl p-4 mb-5 flex flex-wrap gap-6">
                <div>
                  <p className="text-xs text-gray-500">선택된 업무</p>
                  <p className="text-lg font-bold text-[#1B4F72]">{liveStats.taskCount}개</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">총 관련 인원</p>
                  <p className="text-lg font-bold text-[#1B4F72]">{liveStats.totalPeople}명</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">월간 총 시간</p>
                  <p className="text-lg font-bold text-[#00B4D8]">{liveStats.totalHours.toLocaleString()}시간</p>
                </div>
              </div>

              {/* Task Table */}
              <div className="space-y-3">
                {input.tasks.map(task => (
                  <div
                    key={task.id}
                    className={`rounded-xl border p-4 transition-all ${
                      task.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Enable toggle */}
                      <button
                        onClick={() => updateTask(task.id, 'enabled', !task.enabled)}
                        className={`w-6 h-6 rounded flex-shrink-0 flex items-center justify-center transition ${
                          task.enabled ? 'bg-[#00B4D8] text-white' : 'bg-gray-200'
                        }`}
                        aria-label={`${task.label} 자동화 ${task.enabled ? '비활성화' : '활성화'}`}
                      >
                        {task.enabled && <span className="text-xs">✓</span>}
                      </button>

                      {/* Task name */}
                      <div className="flex-1 min-w-[120px]">
                        <p className="text-sm font-semibold text-gray-700">{task.label}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            task.feasibility === 'high' ? 'bg-green-50 text-green-600' :
                            task.feasibility === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                            'bg-gray-50 text-gray-500'
                          }`}>
                            자동화 {Math.round(task.automationRate * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Inputs */}
                      {task.enabled && (
                        <div className="flex items-center gap-3 flex-wrap task-inputs">
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-400">인원</label>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={task.peopleCount}
                              onChange={e => updateTask(task.id, 'peopleCount', Math.max(0, Number(e.target.value)))}
                              className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center focus:border-[#00B4D8] outline-none"
                            />
                            <span className="text-xs text-gray-400">명</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <label className="text-xs text-gray-400">1인당</label>
                            <input
                              type="number"
                              min={0}
                              max={40}
                              value={task.hoursPerPersonWeek}
                              onChange={e => updateTask(task.id, 'hoursPerPersonWeek', Math.max(0, Number(e.target.value)))}
                              className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center focus:border-[#00B4D8] outline-none"
                            />
                            <span className="text-xs text-gray-400">시간/주</span>
                          </div>
                          <div className="text-right min-w-[80px]">
                            <p className="text-xs text-gray-400">월간</p>
                            <p className="text-sm font-bold text-[#1B4F72]">
                              {Math.round(task.peopleCount * task.hoursPerPersonWeek * 4.33)}h
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!canStep2}
                className={`w-full mt-6 py-4 rounded-xl text-white font-semibold text-base transition-all ${
                  canStep2 ? 'bg-[#00B4D8] hover:bg-[#0096B7] shadow-lg shadow-[#00B4D8]/20' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                비용 구조 확인 →
              </button>
            </div>
          </div>
        )}

        {/* ====== STEP 3: 비용 구조 ====== */}
        {step === 3 && (
          <div className="animate-fadeInUp bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-[#1B4F72]">비용 구조 확인</h2>
              <button onClick={() => setStep(2)} className="text-sm text-[#00B4D8] hover:underline">← 이전</button>
            </div>
            <p className="text-sm text-gray-500 mb-6">숨은 비용까지 정확히 산출하기 위한 마지막 정보입니다.</p>

            <div className="space-y-6">
              {/* 평균 월급여 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  해당 업무 담당자 평균 월급여 (만원)
                </label>
                <input
                  type="number"
                  value={input.avgMonthlySalary}
                  onChange={e => setInput({ ...input, avgMonthlySalary: Math.max(0, Number(e.target.value)) })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/20 outline-none transition text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {INDUSTRY_LABELS[input.industry]} 평균 기준 {DEFAULT_SALARY[input.industry]?.toLocaleString()}만원으로 자동 설정됨
                </p>
              </div>

              {/* 오류/재작업률 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  수작업 오류/재작업 발생률 (%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={20}
                    step={1}
                    value={input.errorRate}
                    onChange={e => setInput({ ...input, errorRate: Number(e.target.value) })}
                    className="flex-1 accent-[#00B4D8]"
                  />
                  <span className="text-lg font-bold text-[#1B4F72] w-16 text-right">{input.errorRate}%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>거의 없음</span>
                  <span>보통 (5%)</span>
                  <span>심각 (20%)</span>
                </div>
              </div>

              {/* 컴플라이언스 리스크 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  규제 산업 여부
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setInput({ ...input, complianceRisk: true })}
                    className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      input.complianceRisk
                        ? 'border-[#F59E0B] bg-[#F59E0B]/5 text-[#B45309]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    ⚠️ 예 (규정 준수 필수)
                  </button>
                  <button
                    onClick={() => setInput({ ...input, complianceRisk: false })}
                    className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      !input.complianceRisk
                        ? 'border-[#10B981] bg-[#10B981]/5 text-[#059669]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    ✓ 아니오
                  </button>
                </div>
              </div>

              {/* Summary before calculation */}
              <div className="bg-gradient-to-r from-[#1B4F72] to-[#2563EB] rounded-xl p-5 text-white">
                <p className="text-sm font-semibold text-blue-200 mb-3">분석 대상 요약</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-blue-200 text-xs">산업</p>
                    <p className="font-bold">{INDUSTRY_LABELS[input.industry]}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-xs">분석 업무</p>
                    <p className="font-bold">{liveStats.taskCount}개 업무</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-xs">관련 인원</p>
                    <p className="font-bold">{liveStats.totalPeople}명</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-xs">월간 시간</p>
                    <p className="font-bold">{liveStats.totalHours.toLocaleString()}시간</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCalculate}
                disabled={!canStep3 || loading}
                className={`w-full py-4 rounded-xl text-white font-bold text-base transition-all ${
                  canStep3 && !loading
                    ? 'bg-gradient-to-r from-[#00B4D8] to-[#2563EB] hover:opacity-90 shadow-lg shadow-[#00B4D8]/30'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {loadingMsg}
                  </span>
                ) : (
                  '🔍 AI ROI 심층 분석 시작'
                )}
              </button>
            </div>
          </div>
        )}

        {/* ====== Loading Skeleton (#15) ====== */}
        {loading && step === 3 && (
          <div className="mt-6 space-y-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl animate-shimmer" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-48 rounded animate-shimmer" />
                  <div className="h-3 w-32 rounded animate-shimmer" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="rounded-xl p-4 space-y-2">
                    <div className="h-3 w-16 rounded animate-shimmer" />
                    <div className="h-8 w-24 rounded animate-shimmer" />
                    <div className="h-3 w-20 rounded animate-shimmer" />
                  </div>
                ))}
              </div>
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-3 text-[#00B4D8]">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm font-semibold">{loadingMsg}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====== STEP 4: Results ====== */}
        {step === 4 && result && (
          <ResultsView result={result} input={input} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}
