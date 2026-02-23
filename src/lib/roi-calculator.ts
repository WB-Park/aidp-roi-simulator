import { supabase, Benchmark, CaseStudy, SimulationInput, SimulationResult } from './supabase';

const DEFAULT_BENCHMARKS: Record<string, { reductionRate: number; costRange: [number, number] }> = {
  manufacturing: { reductionRate: 0.6, costRange: [5000, 8000] },
  retail: { reductionRate: 0.4, costRange: [3000, 5000] },
  service: { reductionRate: 0.5, costRange: [2000, 4000] },
  other: { reductionRate: 0.4, costRange: [3000, 6000] },
};

function getEstimatedProjectCost(industry: string, companySize: string): number {
  const benchmark = DEFAULT_BENCHMARKS[industry] || DEFAULT_BENCHMARKS.other;
  const [min, max] = benchmark.costRange;

  // 기업 규모에 따라 프로젝트 비용 조정
  switch (companySize) {
    case '30-100':
      return min;
    case '100-500':
      return Math.round((min + max) / 2);
    case '500+':
      return max;
    default:
      return Math.round((min + max) / 2);
  }
}

export async function calculateROI(input: SimulationInput): Promise<SimulationResult> {
  // DB에서 벤치마크 가져오기 (fallback: 하드코딩)
  let reductionRate: number;

  const { data: benchmarkData } = await supabase
    .from('aidp_benchmarks')
    .select('*')
    .eq('industry', input.industry)
    .single();

  if (benchmarkData) {
    reductionRate = benchmarkData.default_reduction_rate;
  } else {
    reductionRate = DEFAULT_BENCHMARKS[input.industry]?.reductionRate || 0.4;
  }

  // 1. 시간 절감
  const hoursSaved = Math.round(input.currentHoursMonthly * reductionRate);

  // 2. 비용 절감 (연간)
  const monthlySaving = Math.round(input.currentCostMonthly * reductionRate);
  const yearlySaving = monthlySaving * 12;

  // 3. AIDP 투자 비용
  const investmentCost = getEstimatedProjectCost(input.industry, input.companySize);

  // 4. ROI (보수적: 첫 해 기준)
  const roi = Math.round(((yearlySaving - investmentCost) / investmentCost) * 100);

  // 5. 투자 회수 기간
  const paybackMonths = monthlySaving > 0 ? Math.round((investmentCost / monthlySaving) * 10) / 10 : 0;

  // 6. 유사 사례 매칭
  const { data: cases } = await supabase
    .from('aidp_case_studies')
    .select('*')
    .eq('industry', input.industry)
    .eq('is_public', true)
    .limit(2);

  const matchedCases = cases || [];

  // 7. 히스토리 저장
  await supabase.from('aidp_simulations').insert({
    customer_name: input.customerName || null,
    industry: input.industry,
    company_size: input.companySize,
    current_hours_monthly: input.currentHoursMonthly,
    current_cost_monthly: input.currentCostMonthly,
    ai_area: input.aiArea,
    result_hours_saved: hoursSaved,
    result_cost_saved_yearly: yearlySaving,
    result_roi_percent: roi,
    result_payback_months: paybackMonths,
    matched_cases: matchedCases.map(c => c.id),
  });

  return { hoursSaved, monthlySaving, yearlySaving, investmentCost, roi, paybackMonths, matchedCases };
}
