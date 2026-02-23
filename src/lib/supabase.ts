import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// === Case Study (DB) ===
export interface CaseStudy {
  id: string;
  industry: string;
  company_name: string;
  company_size: string;
  annual_revenue: string;
  project_cost: number;
  before_hours_monthly: number;
  after_hours_monthly: number;
  before_cost_monthly: number;
  after_cost_monthly: number;
  ai_area: string;
  testimonial: string;
  project_duration: string;
  is_public: boolean;
}

export interface Benchmark {
  industry: string;
  default_reduction_rate: number;
  avg_project_cost_min: number;
  avg_project_cost_max: number;
}

// === New Enhanced Types ===

export interface TaskInput {
  id: string;
  category: string;
  label: string;
  peopleCount: number;
  hoursPerPersonWeek: number;
  enabled: boolean;
  automationRate: number;
  feasibility: 'high' | 'medium' | 'low';
}

export interface SimulationInput {
  customerName: string;
  industry: string;
  companySize: string;
  annualRevenue: string;
  urgencyLevel: string;
  painPoints: string[];
  tasks: TaskInput[];
  avgMonthlySalary: number; // 만원
  errorRate: number; // %
  complianceRisk: boolean;
}

export interface TaskResult {
  label: string;
  category: string;
  currentHoursMonthly: number;
  currentPeople: number;
  automationRate: number;
  savedHoursMonthly: number;
  savedCostMonthly: number;
  feasibility: 'high' | 'medium' | 'low';
}

export interface HiddenCost {
  category: string;
  label: string;
  description: string;
  monthlyCost: number;
  icon: string;
}

export interface YearProjection {
  year: number;
  cumulativeSaving: number;
  cumulativeInvestment: number;
  netBenefit: number;
  roi: number;
}

export interface SimulationResult {
  // Direct savings
  totalCurrentHoursMonthly: number;
  totalSavedHoursMonthly: number;
  directMonthlySaving: number;
  totalCurrentPeople: number;

  // Hidden costs
  hiddenCosts: HiddenCost[];
  totalHiddenMonthlyCost: number;

  // Total
  totalMonthlySaving: number;
  totalYearlySaving: number;

  // Investment
  investmentCost: number;
  implementationMonths: number;

  // ROI scenarios
  conservativeROI: number;
  moderateROI: number;
  optimisticROI: number;
  paybackMonths: number;

  // Projections
  yearProjections: YearProjection[];
  npv: number;

  // Cost of inaction
  costOfInaction3Year: number;

  // Task breakdown
  taskResults: TaskResult[];

  // Quick wins
  quickWins: string[];

  // Cases
  matchedCases: CaseStudy[];

  // Pain point context
  addressedPainPoints: string[];
  painPointCount: number;
}
