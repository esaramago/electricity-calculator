export interface Reading {
  id: string
  date: string
  vazio: number
  ponta: number
  cheia: number
  total: number
  notes?: string
  created?: string
  updated?: string
}

export interface Proposal {
  id: string
  date: string
  supplier: string
  power_kva: number
  power_tar: number
  power_com: number
  energy_tar: number
  energy_com: number
  is_indexed: boolean
  is_active: boolean
  notes?: string
  created?: string
  updated?: string
}

export type CalculationMethod =
  'all_time' | 'last_12_months' | 'last_6_months' | 'ytd' | 'manual'

export interface ConsumptionStats {
  method: CalculationMethod
  startDate?: string
  endDate?: string
  days: number
  months: number
  deltaTotal: number
  deltaVazio: number
  deltaPonta: number
  deltaCheia: number
  deltaForaDeVazio: number
  monthlyAverageTotal: number
  monthlyAverageVazio: number
  monthlyAveragePonta: number
  monthlyAverageCheia: number
  monthlyAverageForaDeVazio: number
  dailyAverageTotal: number
}

export interface ProposalCalculation {
  proposal: Proposal
  powerDailyTotal: number
  energyKwhTotal: number
  powerMonthlyWithVat: number
  energyMonthlyWithVat: number
  totalMonthlyWithVat: number
  powerMonthlyNoVat: number
  energyMonthlyNoVat: number
  totalMonthlyNoVat: number
  isBest: boolean
}
