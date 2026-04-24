/**
 * App-wide constants. Keep tiny and dependency-free.
 *
 * CURRENT_YEAR auto-rolls on Jan 1. Mock data is authored in MOCK_BASE_YEAR
 * and rebased at load time (see data/index.ts) so the calendar always
 * reflects "this year" without manually touching 80+ event dates.
 */

export const MOCK_BASE_YEAR = 2025

export const CURRENT_YEAR = new Date().getFullYear()
