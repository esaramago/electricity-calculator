import type {
  Reading,
  Proposal,
  CalculationMethod,
  ConsumptionStats,
  ProposalCalculation,
} from './types'

export const CYCLE_DAYS = 30
export const VAT_TAR_POWER = 0.06
export const VAT_COM_POWER = 0.23
export const VAT_ENERGY = 0.06

/**
 * Calculates consumption statistics based on readings and the selected method.
 */
export function calculateConsumption(
  readings: Reading[],
  method: CalculationMethod = 'all_time',
  manualKwh: number = 150,
): ConsumptionStats {
  if (!readings || readings.length === 0) {
    return {
      method,
      days: 0,
      months: 0,
      deltaTotal: 0,
      deltaVazio: 0,
      deltaPonta: 0,
      deltaCheia: 0,
      deltaForaDeVazio: 0,
      monthlyAverageTotal: manualKwh,
      monthlyAverageVazio: manualKwh * 0.2938,
      monthlyAveragePonta: manualKwh * 0.2144,
      monthlyAverageCheia: manualKwh * 0.4918,
      monthlyAverageForaDeVazio: manualKwh * 0.7062,
      dailyAverageTotal: manualKwh / CYCLE_DAYS,
    }
  }

  // Sort readings by date ascending (oldest first)
  const sorted = [...readings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  if (method === 'manual') {
    // Compute baseline ratios from all-time data if available
    const oldest = sorted[0]
    const newest = sorted[sorted.length - 1]
    const dTot =
      (newest.total || newest.vazio + newest.ponta + newest.cheia) -
        (oldest.total || oldest.vazio + oldest.ponta + oldest.cheia) || 1
    const dVazio = newest.vazio - oldest.vazio
    const dPonta = newest.ponta - oldest.ponta
    const dCheia = newest.cheia - oldest.cheia

    const rVazio = dVazio / dTot
    const rPonta = dPonta / dTot
    const rCheia = dCheia / dTot

    return {
      method,
      days: 0,
      months: 0,
      deltaTotal: 0,
      deltaVazio: 0,
      deltaPonta: 0,
      deltaCheia: 0,
      deltaForaDeVazio: 0,
      monthlyAverageTotal: manualKwh,
      monthlyAverageVazio: manualKwh * rVazio,
      monthlyAveragePonta: manualKwh * rPonta,
      monthlyAverageCheia: manualKwh * rCheia,
      monthlyAverageForaDeVazio: manualKwh * (rPonta + rCheia),
      dailyAverageTotal: manualKwh / CYCLE_DAYS,
    }
  }

  const newest = sorted[sorted.length - 1]
  const newestTime = new Date(newest.date).getTime()
  let startIndex = 0

  if (method === 'last_12_months') {
    const targetTime = newestTime - 365 * 24 * 60 * 60 * 1000
    startIndex = findBestStartIndex(sorted, targetTime)
  } else if (method === 'last_6_months') {
    const targetTime = newestTime - 182 * 24 * 60 * 60 * 1000
    startIndex = findBestStartIndex(sorted, targetTime)
  } else if (method === 'ytd') {
    const newestYear = new Date(newest.date).getUTCFullYear()
    const jan1 = new Date(Date.UTC(newestYear, 0, 1)).getTime()
    startIndex = findBestStartIndex(sorted, jan1)
  }

  // Ensure start is strictly before newest
  if (startIndex >= sorted.length - 1) {
    startIndex = Math.max(0, sorted.length - 2)
  }

  const startReading = sorted[startIndex]
  const endReading = newest

  const startDate = new Date(startReading.date)
  const endDate = new Date(endReading.date)

  // Exact days elapsed
  const diffMs = endDate.getTime() - startDate.getTime()
  const days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)))
  const months = days / CYCLE_DAYS

  const startTot =
    startReading.total ||
    startReading.vazio + startReading.ponta + startReading.cheia
  const endTot =
    endReading.total || endReading.vazio + endReading.ponta + endReading.cheia

  const deltaTotal = Math.max(0, endTot - startTot)
  const deltaVazio = Math.max(0, endReading.vazio - startReading.vazio)
  const deltaPonta = Math.max(0, endReading.ponta - startReading.ponta)
  const deltaCheia = Math.max(0, endReading.cheia - startReading.cheia)
  const deltaForaDeVazio = deltaPonta + deltaCheia

  const monthlyAverageTotal = deltaTotal / months
  const monthlyAverageVazio = deltaVazio / months
  const monthlyAveragePonta = deltaPonta / months
  const monthlyAverageCheia = deltaCheia / months
  const monthlyAverageForaDeVazio = deltaForaDeVazio / months
  const dailyAverageTotal = deltaTotal / days

  return {
    method,
    startDate: startReading.date,
    endDate: endReading.date,
    days,
    months,
    deltaTotal,
    deltaVazio,
    deltaPonta,
    deltaCheia,
    deltaForaDeVazio,
    monthlyAverageTotal,
    monthlyAverageVazio,
    monthlyAveragePonta,
    monthlyAverageCheia,
    monthlyAverageForaDeVazio,
    dailyAverageTotal,
  }
}

function findBestStartIndex(sorted: Reading[], targetTime: number): number {
  // Find reading closest to targetTime (preferring the one right before or closest)
  let bestIdx = 0
  let minDiff = Infinity

  for (let i = 0; i < sorted.length - 1; i++) {
    const t = new Date(sorted[i].date).getTime()
    const diff = Math.abs(t - targetTime)
    if (diff < minDiff) {
      minDiff = diff
      bestIdx = i
    }
  }

  return bestIdx
}

/**
 * Calculates costs for all proposals and marks the best deal.
 */
export function calculateAllProposals(
  proposals: Proposal[],
  monthlyKwh: number,
  filterPowerKva?: number,
): ProposalCalculation[] {
  let list = proposals.filter((p) => p.is_active)

  if (filterPowerKva !== undefined && filterPowerKva > 0) {
    list = list.filter((p) => Math.abs(p.power_kva - filterPowerKva) < 0.01)
  }

  const calculated: ProposalCalculation[] = list.map((proposal) => {
    const powerDailyTotal = proposal.power_tar + proposal.power_com
    const energyKwhTotal = proposal.energy_tar + proposal.energy_com

    // Fixed term with VAT: TAR at 6%, Comercializador at 23%
    const powerTarMonthlyWithVat =
      proposal.power_tar * CYCLE_DAYS * (1 + VAT_TAR_POWER)
    const powerComMonthlyWithVat =
      proposal.power_com * CYCLE_DAYS * (1 + VAT_COM_POWER)
    const powerMonthlyWithVat = powerTarMonthlyWithVat + powerComMonthlyWithVat

    // Energy term with VAT: 6%
    const energyMonthlyWithVat =
      (proposal.energy_tar + proposal.energy_com) *
      monthlyKwh *
      (1 + VAT_ENERGY)

    const totalMonthlyWithVat = powerMonthlyWithVat + energyMonthlyWithVat

    const powerMonthlyNoVat = powerDailyTotal * CYCLE_DAYS
    const energyMonthlyNoVat = energyKwhTotal * monthlyKwh
    const totalMonthlyNoVat = powerMonthlyNoVat + energyMonthlyNoVat

    return {
      proposal,
      powerDailyTotal,
      energyKwhTotal,
      powerMonthlyWithVat,
      energyMonthlyWithVat,
      totalMonthlyWithVat,
      powerMonthlyNoVat,
      energyMonthlyNoVat,
      totalMonthlyNoVat,
      isBest: false,
    }
  })

  // Sort by total monthly cost with VAT ascending
  calculated.sort((a, b) => a.totalMonthlyWithVat - b.totalMonthlyWithVat)

  if (calculated.length > 0) {
    calculated[0].isBest = true
  }

  return calculated
}
