/**
 * Supabase Type Override
 * Suppress strict typing for database operations
 */

// Override Supabase types to be more permissive
declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    from(table: string): {
      select(columns?: string): any
      insert(data: any): any
      update(data: any): any
      delete(): any
      eq(column: string, value: any): any
      neq(column: string, value: any): any
      gt(column: string, value: any): any
      gte(column: string, value: any): any
      lt(column: string, value: any): any
      lte(column: string, value: any): any
      like(column: string, pattern: string): any
      ilike(column: string, pattern: string): any
      is(column: string, value: any): any
      in(column: string, values: any[]): any
      contains(column: string, value: any): any
      containedBy(column: string, value: any): any
      rangeGt(column: string, range: any): any
      rangeGte(column: string, range: any): any
      rangeLt(column: string, range: any): any
      rangeLte(column: string, range: any): any
      rangeAdjacent(column: string, range: any): any
      overlaps(column: string, value: any): any
      textSearch(column: string, query: string): any
      match(query: any): any
      not(column: string, operator: string, value: any): any
      or(filters: string): any
      filter(column: string, operator: string, value: any): any
      order(column: string, options?: { ascending?: boolean }): any
      limit(count: number): any
      range(from: number, to: number): any
      single(): any
      maybeSingle(): any
      csv(): any
      geojson(): any
      explain(): any
      rollback(): any
      returns(columns?: string): any
    }
  }
}
