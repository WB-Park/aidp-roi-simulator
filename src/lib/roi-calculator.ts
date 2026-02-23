import { supabase } from './supabase';
import type { SimulationInput, SimulationResult, TaskResult, HiddenCost, YearProjection, CaseStudy } from './supabase';
import { INDUSTRY_BENCHMARKS, PAIN_POINTS } from './constants';

const WEEKS_PER_MONTH = 4.33;
const WORKING_HOURS_PER_MONTH = 174; // 한국 기준
const DISCOUNT_RATE = 0.10; // NPV 할인율 10%

export async function calculateROI(input: SimulationInput): Promise<SimulationResult> {
  const benchmark = INDUSTRY_BENCHMARKS[input.industry] || INDUSTRY_BENCHMARKS.service;
  const hourlyRate = input.avgMonthlySalary / WORKING_HOURS_PER_MONTH; // 만원/시간

  // ============================================================
  // 1. 업무별 분석 (Task-by-Task Analysis)
  // ============================================================
  const enabledTasks = input.tasks.filter(t => t.enabled && t.peopleCount > 0 && t.hoursPerPersonWeek > 0);

  const taskResults: TaskResult[] = enabledTasks.map(task => {
    const monthlyHours = task.peopleCount * task.hoursPerPersonWeek * WEEKS_PER_MONTH;
    const savedHours = Math.round(monthlyHours * task.automationRate);
    const savedCost = Math.round(savedHours * hourlyRate);

    return {
      label: task.label,
      category: task.category,
      currentHoursMonthly: Math.round(monthlyHours),
      currentPeople: task.peopleCount,
      automationRate: task.automationRate,
      savedHoursMonthly: savedHours,
      savedCostMonthly: savedCost,
      feasibility: task.feasibility,
    };
  });

  const totalCurrentHoursMonthly = taskResults.reduce((s, t) => s + t.currentHoursMonthly, 0);
  const totalSavedHoursMonthly = taskResults.reduce((s, t) => s + t.savedHoursMonthly, 0);
  const directMonthlySaving = taskResults.reduce((s, t) => s + t.savedCostMonthly, 0);
  const totalCurrentPeople = enabledTasks.reduce((s, t) => s + t.peopleCount, 0);

  // ============================================================
  // 2. 숨은 비용 산출 (Hidden Cost Discovery)
  // ============================================================
  const hiddenCosts: HiddenCost[] = [];
  const directMonthlyCost = Math.round(totalCurrentHoursMonthly * hourlyRate);

  // 2-1. 오류/재작업 비용
  if (input.errorRate > 0) {
    const errorCost = Math.round(directMonthlyCost * (input.errorRate / 100) * 1.5);
    hiddenCosts.push({
      category: 'error',
      label: '오류/재작업 비용',
      description: `오류율 ${input.errorRate}% 기준, 수정에 1.5배 비용 소요`,
      monthlyCost: errorCost,
      icon: '🔴',
    });
  }

  // 2-2. 기회비용 (수작업에 묶인 인력의 전략 업무 불가)
  const opportunityCost = Math.round(totalSavedHoursMonthly * hourlyRate * 0.3);
  if (opportunityCost > 0) {
    hiddenCosts.push({
      category: 'opportunity',
      label: '기회비용 (전략 업무 불가)',
      description: `${totalSavedHoursMonthly}시간이 고부가가치 업무로 전환 가능`,
      monthlyCost: opportunityCost,
      icon: '💡',
    });
  }

  // 2-3. 이직/채용 비용 (반복 업무로 인한 높은 이직률)
  if (totalCurrentPeople >= 3) {
    const turnoverCost = Math.round(totalCurrentPeople * 0.15 * input.avgMonthlySalary * 2 / 12);
    hiddenCosts.push({
      category: 'turnover',
      label: '이직/채용 관련 비용',
      description: `반복 업무 담당 ${totalCurrentPeople}명 중 연 15% 이직 추정`,
      monthlyCost: turnoverCost,
      icon: '👥',
    });
  }

  // 2-4. 의사결정 지연 비용
  const reportingTasks = taskResults.filter(t =>
    t.category === 'reporting' || t.category === 'analysis' || t.category === 'risk'
  );
  if (reportingTasks.length > 0) {
    const delayHours = reportingTasks.reduce((s, t) => s + t.currentHoursMonthly, 0);
    const delayCost = Math.round(delayHours * hourlyRate * 0.2);
    hiddenCosts.push({
      category: 'delay',
      label: '의사결정 지연 비용',
      description: `보고/분석 ${delayHours}시간 소요로 인한 의사결정 지연`,
      monthlyCost: delayCost,
      icon: '⏱️',
    });
  }

  // 2-5. 컴플라이언스 리스크
  if (input.complianceRisk) {
    const revMultiplier = input.annualRevenue === '500+' ? 50000 :
      input.annualRevenue === '100-500' ? 30000 :
      input.annualRevenue === '50-100' ? 7500 :
      input.annualRevenue === '10-50' ? 3000 : 1000;
    const complianceCost = Math.round(revMultiplier * 0.001 / 12 * 100) ; // 0.1% of revenue annualized
    if (complianceCost > 0) {
      hiddenCosts.push({
        category: 'compliance',
        label: '규정 위반 리스크 비용',
        description: '수작업 검증 누락으로 인한 예상 리스크 비용',
        monthlyCost: Math.round(complianceCost),
        icon: '⚠️',
      });
    }
  }

  const totalHiddenMonthlyCost = hiddenCosts.reduce((s, c) => s + c.monthlyCost, 0);
  const totalMonthlySaving = directMonthlySaving + Math.round(totalHiddenMonthlyCost * 0.6); // 숨은비용의 60% 절감 가정
  const totalYearlySaving = totalMonthlySaving * 12;

  // ============================================================
  // 3. 투자 비용 산출
  // ============================================================
  const [costMin, costMax] = benchmark.projectCostRange;
  let investmentCost: number;
  switch (input.companySize) {
    case '10-30': investmentCost = costMin; break;
    case '30-100': investmentCost = Math.round(costMin + (costMax - costMin) * 0.3); break;
    case '100-500': investmentCost = Math.round((costMin + costMax) / 2); break;
    case '500+': investmentCost = costMax; break;
    default: investmentCost = Math.round((costMin + costMax) / 2);
  }

  const [implMin, implMax] = benchmark.implementationMonths;
  const implementationMonths = Math.round((implMin + implMax) / 2);

  // ============================================================
  // 4. ROI 시나리오 (보수적 / 기본 / 낙관적)
  // ============================================================
  const conservativeSaving = Math.round(totalYearlySaving * 0.7);
  const moderateSaving = totalYearlySaving;
  const optimisticSaving = Math.round(totalYearlySaving * 1.3);

  const conservativeROI = Math.round(((conservativeSaving - investmentCost) / investmentCost) * 100);
  const moderateROI = Math.round(((moderateSaving - investmentCost) / investmentCost) * 100);
  const optimisticROI = Math.round(((optimisticSaving - investmentCost) / investmentCost) * 100);

  const paybackMonths = totalMonthlySaving > 0
    ? Math.round((investmentCost / totalMonthlySaving) * 10) / 10
    : 0;

  // ============================================================
  // 5. 3년 프로젝션
  // ============================================================
  const yearProjections: YearProjection[] = [];
  let cumulativeSaving = 0;
  const maintenanceCostYearly = Math.round(investmentCost * 0.15); // 연간 유지비 15%

  for (let year = 1; year <= 3; year++) {
    const yearSaving = Math.round(totalYearlySaving * (1 + (year - 1) * 0.1)); // 연간 10% 효율 증가
    cumulativeSaving += yearSaving;
    const cumulativeInvestment = investmentCost + maintenanceCostYearly * (year - 1);
    const netBenefit = cumulativeSaving - cumulativeInvestment;
    const roi = Math.round((netBenefit / cumulativeInvestment) * 100);
    yearProjections.push({ year, cumulativeSaving, cumulativeInvestment, netBenefit, roi });
  }

  // ============================================================
  // 6. NPV 계산
  // ============================================================
  let npv = -investmentCost;
  for (let year = 1; year <= 3; year++) {
    const yearCF = Math.round(totalYearlySaving * (1 + (year - 1) * 0.1)) - (year > 1 ? maintenanceCostYearly : 0);
    npv += yearCF / Math.pow(1 + DISCOUNT_RATE, year);
  }
  npv = Math.round(npv);

  // ============================================================
  // 7. Cost of Inaction (3년간 아무것도 안하면)
  // ============================================================
  let costOfInaction3Year = 0;
  for (let year = 1; year <= 3; year++) {
    costOfInaction3Year += Math.round((directMonthlyCost + totalHiddenMonthlyCost) * 12 * (1 + (year - 1) * 0.05));
  }

  // ============================================================
  // 8. Quick Wins 식별
  // ============================================================
  const quickWins = taskResults
    .filter(t => t.feasibility === 'high' && t.savedCostMonthly > 0)
    .sort((a, b) => b.savedCostMonthly - a.savedCostMonthly)
    .slice(0, 3)
    .map(t => `${t.label}: 월 ${t.savedHoursMonthly}시간, ${t.savedCostMonthly.toLocaleString()}만원 절감 가능`);

  // ============================================================
  // 9. 유사 사례 & Pain Point 매칭
  // ============================================================
  const { data: cases } = await supabase
    .from('aidp_case_studies')
    .select('*')
    .eq('industry', input.industry)
    .eq('is_public', true)
    .limit(2);
  const matchedCases = cases || [];

  const industryPains = PAIN_POINTS[input.industry] || [];
  const addressedPainPoints = industryPains
    .filter(p => input.painPoints.includes(p.id))
    .map(p => p.label);

  // ============================================================
  // 10. 히스토리 저장
  // ============================================================
  try {
    await supabase.from('aidp_simulations').insert({
      customer_name: input.customerName || null,
      industry: input.industry,
      company_size: input.companySize,
      current_hours_monthly: totalCurrentHoursMonthly,
      current_cost_monthly: directMonthlyCost,
      ai_area: enabledTasks.map(t => t.category).join(','),
      result_hours_saved: totalSavedHoursMonthly,
      result_cost_saved_yearly: totalYearlySaving,
      result_roi_percent: moderateROI,
      result_payback_months: paybackMonths,
      matched_cases: matchedCases.map(c => c.id),
    });
  } catch {
    // 저장 실패해도 결과는 반환
  }

  return {
    totalCurrentHoursMonthly,
    totalSavedHoursMonthly,
    directMonthlySaving,
    totalCurrentPeople,
    hiddenCosts,
    totalHiddenMonthlyCost,
    totalMonthlySaving,
    totalYearlySaving,
    investmentCost,
    implementationMonths,
    conservativeROI,
    moderateROI,
    optimisticROI,
    paybackMonths,
    yearProjections,
    npv,
    costOfInaction3Year,
    taskResults,
    quickWins,
    matchedCases,
    addressedPainPoints,
    painPointCount: input.painPoints.length,
  };
}
