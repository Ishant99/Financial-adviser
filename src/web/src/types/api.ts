export interface NetWorthDto {
  totalNetWorth: number;
  currency: string;
  asOf: string;
  breakdown: NetWorthCategoryDto[];
}

export interface NetWorthCategoryDto {
  category: string;
  value: number;
  percentOfTotal: number;
}

export interface HoldingDto {
  id: string;
  accountId: string;
  holdingType: string;
  name: string;
  units: number;
  purchaseNav: number;
  currentNav: number;
  currentValue: number;
  gainLossPercent: number;
  asOf: string;
}

export interface AddHoldingRequest {
  accountId: string;
  holdingType: string;
  name: string;
  units: number;
  purchaseNav: number;
  currentNav: number;
  asOf: string;
}

export interface UpdateHoldingRequest {
  name: string;
  units: number;
  purchaseNav: number;
  currentNav: number;
  asOf: string;
}

export interface AssetAllocationDto {
  equityPercent: number;
  debtPercent: number;
  goldPercent: number;
  cashPercent: number;
}

export interface GoalDto {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  priority: number;
  status: string;
  targetAssetAllocation: AssetAllocationDto;
  probabilityOfSuccess?: number;
  p10Corpus?: number;
  p50Corpus?: number;
  p90Corpus?: number;
  createdAt: string;
}

export interface AddGoalRequest {
  name: string;
  targetAmount: number;
  targetDate: string;
  priority: number;
  targetAssetAllocation: AssetAllocationDto;
}

export interface TransactionDto {
  id: string;
  accountId: string;
  date: string;
  amount: number;
  transactionType: string;
  category: string;
  description: string;
  isReconciled: boolean;
}

export interface AddTransactionRequest {
  accountId: string;
  date: string;
  amount: number;
  transactionType: string;
  category: string;
  description: string;
}

export interface UpdateTransactionRequest {
  date: string;
  amount: number;
  transactionType: string;
  category: string;
  description: string;
}

export interface NetWorthHistoryPointDto {
  year: number;
  month: number;
  label: string;
  value: number;
}

export interface SipPlanDto {
  id: string;
  fundName: string;
  fundCode: string;
  monthlyAmount: number;
  sipDate: number;
  startDate: string;
  status: string;
  linkedGoalId?: string;
  linkedGoalName?: string;
  benchmarkIndex: string;
  latestXirr?: number;
  xirrCalculatedAt?: string;
}

export interface AddSipPlanRequest {
  fundName: string;
  fundCode: string;
  monthlyAmount: number;
  sipDate: number;
  startDate: string;
  benchmarkIndex: string;
  linkedGoalId?: string;
}

export interface AccountDto {
  id: string;
  name: string;
  accountType: string;
  institutionName: string;
  accountNumber?: string;
  isActive: boolean;
}

export interface MonthlyPlanSection {
  title: string;
  amount?: number;
  narrative: string;
}

export interface MonthlyPlanResponse {
  surplus: number;
  sections: MonthlyPlanSection[];
  overallNarrative: string;
}

export interface CashFlowMonthDto {
  year: number;
  month: number;
  label: string;
  totalIncome: number;
  totalExpenses: number;
  net: number;
  categories: { category: string; amount: number; type: string }[];
}

export interface TaxSummaryDto {
  financialYear: string;
  ltcgGains: number;
  stcgGains: number;
  estimatedLtcgTax: number;
  estimatedStcgTax: number;
  totalInvestedSection80C: number;
  holdings: TaxHoldingDto[];
}

export interface TaxHoldingDto {
  name: string;
  purchaseDate: string;
  currentValue: number;
  gainLoss: number;
  holdingMonths: number;
  taxCategory: string;
}

export interface RecommendationDto {
  id: string;
  generatedAt: string;
  type: string;
  category: string;
  severity: string;
  title: string;
  body: string;
  isRead: boolean;
  isActioned: boolean;
}

export interface HoldingAnalyticsDto {
  name: string;
  holdingType: string;
  currentValue: number;
  purchasedValue: number;
  gainLoss: number;
  gainLossPercent: number;
  cagr?: number;
  holdingMonths: number;
}

export interface AllocationByTypeDto {
  holdingType: string;
  totalValue: number;
  percentOfPortfolio: number;
  holdingCount: number;
}

export interface ConcentrationRiskDto {
  name: string;
  holdingType: string;
  value: number;
  percentOfPortfolio: number;
}

export interface PortfolioAnalyticsDto {
  totalValue: number;
  totalPurchasedValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  allocationByType: AllocationByTypeDto[];
  topConcentrations: ConcentrationRiskDto[];
  holdings: HoldingAnalyticsDto[];
}

export interface CasImportResult {
  holdingsImported: number;
  holdingsUpdated: number;
  investorName: string;
  totalValue: number;
  uploadLogId: string;
}

export interface CasUploadLogDto {
  id: string;
  uploadedAt: string;
  fileName: string;
  holdingsImported: number;
  holdingsUpdated: number;
  status: string;
  investorName?: string;
  errorMessage?: string;
}
