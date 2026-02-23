import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export interface SimulationResult {
  hoursSaved: number;
  monthlySaving: number;
  yearlySaving: number;
  investmentCost: number;
  roi: number;
  paybackMonths: number;
  matchedCases: CaseStudy[];
}

export interface SimulationInput {
  customerName: string;
  industry: string;
  companySize: string;
  currentHoursMonthly: number;
  currentCostMonthly: number;
  aiArea: string;
}
