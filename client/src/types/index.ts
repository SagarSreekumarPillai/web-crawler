export type UrlRecord = {
  id: number
  url: string
  created_at: string
  last_crawled_at: string
  title: string
  html_version: string
  h1_count: number
  h2_count: number
  h3_count: number
  internal_links: number
  external_links: number
  broken_links: string[]
  has_login_form: boolean
  status?: string
} 