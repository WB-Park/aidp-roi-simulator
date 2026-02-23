// ============================================================
// AIDP ROI Simulator - Industry Constants & Templates
// 50가지 개선사항 반영: 다중 관점 (CEO, CFO, CTO, PO, HR, AI담당, 사업개발)
// ============================================================

// === 산업 분류 ===
export const INDUSTRIES = [
  { value: 'manufacturing', label: '제조업', icon: '🏭', desc: '생산·품질·재고 관리' },
  { value: 'retail', label: '유통/이커머스', icon: '🛒', desc: '주문·재고·고객 관리' },
  { value: 'finance', label: '금융/보험', icon: '🏦', desc: '심사·정산·리스크 관리' },
  { value: 'service', label: 'IT/서비스', icon: '💻', desc: '개발·운영·고객지원' },
  { value: 'healthcare', label: '의료/바이오', icon: '🏥', desc: '임상·데이터·규정 관리' },
  { value: 'logistics', label: '물류/운송', icon: '🚛', desc: '배차·추적·정산 관리' },
];

export const COMPANY_SIZES = [
  { value: '10-30', label: '10~30명', desc: '스타트업/소기업' },
  { value: '30-100', label: '30~100명', desc: '중소기업' },
  { value: '100-500', label: '100~500명', desc: '중견기업' },
  { value: '500+', label: '500명 이상', desc: '대기업' },
];

export const REVENUE_RANGES = [
  { value: 'under-10', label: '10억 미만' },
  { value: '10-50', label: '10~50억' },
  { value: '50-100', label: '50~100억' },
  { value: '100-500', label: '100~500억' },
  { value: '500+', label: '500억 이상' },
];

export const URGENCY_LEVELS = [
  { value: 'exploring', label: '탐색 단계', desc: 'AI 도입을 검토 중', color: '#94A3B8' },
  { value: 'planning', label: '도입 계획 중', desc: '올해 내 도입 목표', color: '#00B4D8' },
  { value: 'urgent', label: '시급함', desc: '분기 내 도입 필요', color: '#F59E0B' },
  { value: 'critical', label: '매우 시급', desc: '즉시 도입해야 함', color: '#EF4444' },
];

// === 산업별 고통 포인트 ===
export const PAIN_POINTS: Record<string, { id: string; label: string; impact: 'high' | 'medium' | 'low' }[]> = {
  manufacturing: [
    { id: 'mp1', label: '수기 데이터 입력으로 인한 오류 빈발', impact: 'high' },
    { id: 'mp2', label: '실시간 생산 현황 파악 불가', impact: 'high' },
    { id: 'mp3', label: '품질 이슈 대응 지연 (불량 추적 어려움)', impact: 'high' },
    { id: 'mp4', label: '재고 과다/부족 반복', impact: 'medium' },
    { id: 'mp5', label: '보고서 작성에 과도한 시간 소요', impact: 'medium' },
    { id: 'mp6', label: '숙련 인력 의존도 높음 (노하우 유실 위험)', impact: 'high' },
    { id: 'mp7', label: '설비 예방정비 못하고 사후 대응만', impact: 'medium' },
    { id: 'mp8', label: '납기 지연 반복', impact: 'high' },
  ],
  retail: [
    { id: 'rp1', label: '재고 정확도 낮음 (실사 vs 시스템 불일치)', impact: 'high' },
    { id: 'rp2', label: '수요 예측 어려워 과잉/품절 반복', impact: 'high' },
    { id: 'rp3', label: '고객 응대 품질 편차 큼', impact: 'medium' },
    { id: 'rp4', label: '가격/프로모션 분석에 시간 소요', impact: 'medium' },
    { id: 'rp5', label: '반품/클레임 처리 지연', impact: 'high' },
    { id: 'rp6', label: '매출 데이터 집계가 느림', impact: 'medium' },
    { id: 'rp7', label: '고객 이탈 원인 파악 어려움', impact: 'high' },
    { id: 'rp8', label: '옴니채널 데이터 통합 안됨', impact: 'medium' },
  ],
  finance: [
    { id: 'fp1', label: '심사/승인 프로세스 병목', impact: 'high' },
    { id: 'fp2', label: '규정 준수 검증에 과도한 인력 투입', impact: 'high' },
    { id: 'fp3', label: '이상거래 탐지 지연', impact: 'high' },
    { id: 'fp4', label: '보고서/공시 자료 작성 수작업', impact: 'medium' },
    { id: 'fp5', label: '고객 문서 검토에 시간 과다', impact: 'medium' },
    { id: 'fp6', label: '리스크 분석 수동적', impact: 'high' },
    { id: 'fp7', label: '정산/결산 마감 지연', impact: 'medium' },
    { id: 'fp8', label: '고객 세그먼트 분석 부재', impact: 'medium' },
  ],
  service: [
    { id: 'sp1', label: '반복 문의 응대에 시간 과다', impact: 'high' },
    { id: 'sp2', label: '고객 이력 관리 분산 (시스템 파편화)', impact: 'high' },
    { id: 'sp3', label: '서비스 품질 표준화 어려움', impact: 'medium' },
    { id: 'sp4', label: '일정 충돌/누락 발생', impact: 'medium' },
    { id: 'sp5', label: '정산 오류 및 지연', impact: 'medium' },
    { id: 'sp6', label: '성과 측정이 주관적', impact: 'medium' },
    { id: 'sp7', label: '코드 리뷰/테스트에 시간 과다', impact: 'high' },
    { id: 'sp8', label: '인시던트 대응 체계 미흡', impact: 'high' },
  ],
  healthcare: [
    { id: 'hp1', label: '환자 데이터 입력/정리에 시간 과다', impact: 'high' },
    { id: 'hp2', label: '임상 문서 작성 부담', impact: 'high' },
    { id: 'hp3', label: '규정(GMP/IRB) 준수 검증 수작업', impact: 'high' },
    { id: 'hp4', label: '논문/임상 데이터 분석 느림', impact: 'medium' },
    { id: 'hp5', label: '재고(약품/소모품) 관리 부정확', impact: 'medium' },
    { id: 'hp6', label: '보험 청구/정산 오류 빈발', impact: 'high' },
    { id: 'hp7', label: '환자 스케줄링 비효율', impact: 'medium' },
    { id: 'hp8', label: '연구 데이터 표준화 안됨', impact: 'medium' },
  ],
  logistics: [
    { id: 'lp1', label: '배차/경로 최적화 수동', impact: 'high' },
    { id: 'lp2', label: '실시간 화물 추적 불가', impact: 'high' },
    { id: 'lp3', label: '운송장/서류 처리 수작업', impact: 'medium' },
    { id: 'lp4', label: '정산/청구 오류 빈발', impact: 'high' },
    { id: 'lp5', label: '수요 예측 못해 공차율 높음', impact: 'high' },
    { id: 'lp6', label: '배송 지연 대응 느림', impact: 'medium' },
    { id: 'lp7', label: '창고 공간 활용 비효율', impact: 'medium' },
    { id: 'lp8', label: '거래처 커뮤니케이션 누락', impact: 'medium' },
  ],
};

// === 산업별 업무 템플릿 (자동화 가능률 포함) ===
export interface TaskTemplate {
  id: string;
  category: string;
  label: string;
  defaultPeople: number;
  defaultHoursPerWeek: number;
  automationRate: number; // 0~1
  feasibility: 'high' | 'medium' | 'low';
}

export const TASK_TEMPLATES: Record<string, TaskTemplate[]> = {
  manufacturing: [
    { id: 'mt1', category: 'data_entry', label: '생산 데이터 입력/정리', defaultPeople: 3, defaultHoursPerWeek: 8, automationRate: 0.85, feasibility: 'high' },
    { id: 'mt2', category: 'reporting', label: '품질 검사 보고서 작성', defaultPeople: 2, defaultHoursPerWeek: 6, automationRate: 0.70, feasibility: 'high' },
    { id: 'mt3', category: 'inventory', label: '재고 관리 및 발주', defaultPeople: 2, defaultHoursPerWeek: 10, automationRate: 0.75, feasibility: 'high' },
    { id: 'mt4', category: 'scheduling', label: '생산 일정 수립/조정', defaultPeople: 2, defaultHoursPerWeek: 5, automationRate: 0.50, feasibility: 'medium' },
    { id: 'mt5', category: 'inspection', label: '설비 점검 기록/관리', defaultPeople: 2, defaultHoursPerWeek: 4, automationRate: 0.60, feasibility: 'medium' },
    { id: 'mt6', category: 'analysis', label: '불량 분석 및 원인 추적', defaultPeople: 1, defaultHoursPerWeek: 8, automationRate: 0.65, feasibility: 'medium' },
  ],
  retail: [
    { id: 'rt1', category: 'order', label: '주문/반품 처리', defaultPeople: 3, defaultHoursPerWeek: 10, automationRate: 0.80, feasibility: 'high' },
    { id: 'rt2', category: 'inventory', label: '재고 실사 및 조정', defaultPeople: 2, defaultHoursPerWeek: 8, automationRate: 0.75, feasibility: 'high' },
    { id: 'rt3', category: 'reporting', label: '매출/성과 보고서 작성', defaultPeople: 2, defaultHoursPerWeek: 6, automationRate: 0.75, feasibility: 'high' },
    { id: 'rt4', category: 'support', label: '고객 문의 응대', defaultPeople: 4, defaultHoursPerWeek: 15, automationRate: 0.60, feasibility: 'medium' },
    { id: 'rt5', category: 'pricing', label: '가격/프로모션 분석', defaultPeople: 1, defaultHoursPerWeek: 6, automationRate: 0.55, feasibility: 'medium' },
    { id: 'rt6', category: 'vendor', label: '공급업체 커뮤니케이션', defaultPeople: 2, defaultHoursPerWeek: 5, automationRate: 0.50, feasibility: 'medium' },
  ],
  finance: [
    { id: 'ft1', category: 'review', label: '심사/승인 문서 검토', defaultPeople: 4, defaultHoursPerWeek: 12, automationRate: 0.70, feasibility: 'high' },
    { id: 'ft2', category: 'compliance', label: '규정 준수 검증', defaultPeople: 2, defaultHoursPerWeek: 10, automationRate: 0.65, feasibility: 'medium' },
    { id: 'ft3', category: 'reporting', label: '보고서/공시자료 작성', defaultPeople: 2, defaultHoursPerWeek: 8, automationRate: 0.75, feasibility: 'high' },
    { id: 'ft4', category: 'settlement', label: '정산/결산 처리', defaultPeople: 3, defaultHoursPerWeek: 10, automationRate: 0.80, feasibility: 'high' },
    { id: 'ft5', category: 'risk', label: '리스크/이상거래 분석', defaultPeople: 2, defaultHoursPerWeek: 8, automationRate: 0.60, feasibility: 'medium' },
    { id: 'ft6', category: 'crm', label: '고객 데이터 분석/세분화', defaultPeople: 1, defaultHoursPerWeek: 6, automationRate: 0.70, feasibility: 'high' },
  ],
  service: [
    { id: 'st1', category: 'support', label: '고객 문의/티켓 응대', defaultPeople: 4, defaultHoursPerWeek: 15, automationRate: 0.65, feasibility: 'high' },
    { id: 'st2', category: 'data', label: '고객/프로젝트 데이터 관리', defaultPeople: 2, defaultHoursPerWeek: 6, automationRate: 0.80, feasibility: 'high' },
    { id: 'st3', category: 'reporting', label: '서비스/성과 보고서 작성', defaultPeople: 2, defaultHoursPerWeek: 5, automationRate: 0.75, feasibility: 'high' },
    { id: 'st4', category: 'scheduling', label: '일정/리소스 관리', defaultPeople: 1, defaultHoursPerWeek: 5, automationRate: 0.55, feasibility: 'medium' },
    { id: 'st5', category: 'billing', label: '청구/정산 처리', defaultPeople: 2, defaultHoursPerWeek: 8, automationRate: 0.80, feasibility: 'high' },
    { id: 'st6', category: 'testing', label: '코드 리뷰/QA 테스트', defaultPeople: 3, defaultHoursPerWeek: 10, automationRate: 0.45, feasibility: 'medium' },
  ],
  healthcare: [
    { id: 'ht1', category: 'data_entry', label: '환자 데이터 입력/정리', defaultPeople: 3, defaultHoursPerWeek: 10, automationRate: 0.80, feasibility: 'high' },
    { id: 'ht2', category: 'documentation', label: '임상 문서/차트 작성', defaultPeople: 3, defaultHoursPerWeek: 8, automationRate: 0.65, feasibility: 'medium' },
    { id: 'ht3', category: 'compliance', label: '규정(GMP/IRB) 검증', defaultPeople: 2, defaultHoursPerWeek: 6, automationRate: 0.60, feasibility: 'medium' },
    { id: 'ht4', category: 'billing', label: '보험 청구/정산', defaultPeople: 2, defaultHoursPerWeek: 10, automationRate: 0.80, feasibility: 'high' },
    { id: 'ht5', category: 'scheduling', label: '환자 스케줄링', defaultPeople: 2, defaultHoursPerWeek: 6, automationRate: 0.70, feasibility: 'high' },
    { id: 'ht6', category: 'analysis', label: '연구/임상 데이터 분석', defaultPeople: 2, defaultHoursPerWeek: 8, automationRate: 0.55, feasibility: 'medium' },
  ],
  logistics: [
    { id: 'lt1', category: 'routing', label: '배차/경로 계획', defaultPeople: 2, defaultHoursPerWeek: 10, automationRate: 0.80, feasibility: 'high' },
    { id: 'lt2', category: 'documentation', label: '운송장/서류 처리', defaultPeople: 3, defaultHoursPerWeek: 8, automationRate: 0.85, feasibility: 'high' },
    { id: 'lt3', category: 'tracking', label: '화물 추적/상태 업데이트', defaultPeople: 2, defaultHoursPerWeek: 10, automationRate: 0.75, feasibility: 'high' },
    { id: 'lt4', category: 'settlement', label: '운임 정산/청구', defaultPeople: 2, defaultHoursPerWeek: 8, automationRate: 0.80, feasibility: 'high' },
    { id: 'lt5', category: 'forecasting', label: '수요 예측/용량 계획', defaultPeople: 1, defaultHoursPerWeek: 6, automationRate: 0.60, feasibility: 'medium' },
    { id: 'lt6', category: 'communication', label: '거래처 커뮤니케이션', defaultPeople: 2, defaultHoursPerWeek: 6, automationRate: 0.50, feasibility: 'medium' },
  ],
};

// === 산업별 평균 월급여 (만원) ===
export const DEFAULT_SALARY: Record<string, number> = {
  manufacturing: 350,
  retail: 300,
  finance: 450,
  service: 400,
  healthcare: 400,
  logistics: 320,
};

// === 산업별 벤치마크 ===
export const INDUSTRY_BENCHMARKS: Record<string, {
  avgAutomationRate: number;
  projectCostRange: [number, number];
  implementationMonths: [number, number];
  industryAdoptionRate: number; // % of companies that adopted AI
}> = {
  manufacturing: { avgAutomationRate: 0.65, projectCostRange: [5000, 12000], implementationMonths: [3, 6], industryAdoptionRate: 34 },
  retail: { avgAutomationRate: 0.55, projectCostRange: [3000, 8000], implementationMonths: [2, 5], industryAdoptionRate: 41 },
  finance: { avgAutomationRate: 0.60, projectCostRange: [6000, 15000], implementationMonths: [3, 8], industryAdoptionRate: 52 },
  service: { avgAutomationRate: 0.55, projectCostRange: [2000, 6000], implementationMonths: [2, 4], industryAdoptionRate: 47 },
  healthcare: { avgAutomationRate: 0.50, projectCostRange: [5000, 12000], implementationMonths: [4, 8], industryAdoptionRate: 28 },
  logistics: { avgAutomationRate: 0.60, projectCostRange: [4000, 10000], implementationMonths: [2, 5], industryAdoptionRate: 36 },
};

// === 산업 라벨 맵 ===
export const INDUSTRY_LABELS: Record<string, string> = {
  manufacturing: '제조업',
  retail: '유통/이커머스',
  finance: '금융/보험',
  service: 'IT/서비스',
  healthcare: '의료/바이오',
  logistics: '물류/운송',
};
