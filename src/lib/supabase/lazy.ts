// supabase-js pesa ~50 KB comprimido: los componentes que están en todas las páginas (header,
// footer, PWA) lo cargan recién cuando lo usan, así no entra en el JS inicial ni demora la hidratación.
export async function loadSupabase() {
  const { createClient } = await import("./client")
  return createClient()
}
