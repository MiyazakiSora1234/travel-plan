// Backendは日付を "YYYY-MM-DD" (LocalDate) の文字列で返す。
// new Date('2026-09-10') はUTC 0時としてパースされるため、負のUTCオフセットの
// タイムゾーンで表示すると前日にずれる。日付文字列は Date に変換せず、
// 文字列のまま分解して扱うことでtimezoneの影響を避ける。
function parseIsoDate(isoDate: string): { year: number; month: number; day: number } {
  const [year, month, day] = isoDate.split('-').map(Number)
  return { year, month, day }
}

// "2026-09-10" -> "2026/09/10"
export function formatTripDate(isoDate: string): string {
  const { year, month, day } = parseIsoDate(isoDate)
  return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`
}

// "2026-09-10", "2026-09-13" -> "2026/09/10 - 2026/09/13"
export function formatTripDateRange(startDate: string, endDate: string): string {
  return `${formatTripDate(startDate)} - ${formatTripDate(endDate)}`
}

// 開始日・終了日を含む日数を計算する（例: 09/10〜09/13 は4日間）。
// UTCの日付として差分を取ることで、実行環境のタイムゾーンに結果が左右されないようにする。
export function calculateTripDays(startDate: string, endDate: string): number {
  const start = parseIsoDate(startDate)
  const end = parseIsoDate(endDate)
  const startUtc = Date.UTC(start.year, start.month - 1, start.day)
  const endUtc = Date.UTC(end.year, end.month - 1, end.day)
  const diffDays = Math.round((endUtc - startUtc) / (1000 * 60 * 60 * 24))
  return diffDays + 1
}
