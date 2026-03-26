// In-memory task store shared between scrape routes
// Resets on redeploy — acceptable for short-lived tasks
export const scrapeTasks: Record<string, {
  status: 'running' | 'done' | 'error'
  result: unknown[] | null
  error: string | null
  progress?: number
  total?: number
  label?: string
}> = {}
