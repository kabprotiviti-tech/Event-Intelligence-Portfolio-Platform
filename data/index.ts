import type { Event } from '@/types'
import { abuDhabiEvents as adSource } from './mock-events-abudhabi'
import { dubaiEvents as dxbSource } from './mock-events-dubai'
import { gccEvents as gccSource } from './mock-events-gcc'
import { MOCK_BASE_YEAR, CURRENT_YEAR } from '@/lib/config'

/**
 * Mock events are authored with MOCK_BASE_YEAR dates (e.g. "2025-01-10").
 * At module load we shift every date by (CURRENT_YEAR - MOCK_BASE_YEAR)
 * so the calendar auto-rolls every year without re-authoring mock data.
 * Month and day are preserved — the portfolio's temporal shape is stable.
 */

const SHIFT_YEARS = CURRENT_YEAR - MOCK_BASE_YEAR

function shiftDateString(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  d.setUTCFullYear(d.getUTCFullYear() + SHIFT_YEARS)
  return d.toISOString().slice(0, 10)
}

function rebase(events: Event[]): Event[] {
  if (SHIFT_YEARS === 0) return events
  return events.map(e => ({
    ...e,
    start_date: shiftDateString(e.start_date),
    end_date: e.end_date ? shiftDateString(e.end_date) : undefined,
  }))
}

export const abuDhabiEvents = rebase(adSource)
export const dubaiEvents    = rebase(dxbSource)
export const gccEvents      = rebase(gccSource)

export const allEvents = [...abuDhabiEvents, ...dubaiEvents, ...gccEvents]
