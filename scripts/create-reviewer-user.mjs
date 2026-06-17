/**
 * Crea el usuario revisor de Google Play y lo asocia a un negocio de demo.
 * Uso: node scripts/create-reviewer-user.mjs <SERVICE_ROLE_KEY>
 */

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://mipljgnmpkkfveoaqlyx.supabase.co"
const SERVICE_ROLE_KEY = process.argv[2]

if (!SERVICE_ROLE_KEY) {
  console.error("❌ Falta la service_role key. Uso: node scripts/create-reviewer-user.mjs <SERVICE_ROLE_KEY>")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const EMAIL = "revisor.playstore@calamuchita-app.com"
const PASSWORD = "PlayReview2024!"

async function main() {
  console.log("🚀 Creando usuario revisor de Google Play...")

  // 1. Crear usuario en Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: "Restaurante Demo",
      role: "business",
    },
  })

  if (authError) {
    if (authError.message.includes("already been registered") || authError.code === "email_exists") {
      console.log("⚠️  El usuario ya existe. Buscando su ID...")
      const { data: listData } = await supabase.auth.admin.listUsers()
      const existing = listData?.users?.find(u => u.email === EMAIL)
      if (!existing) {
        console.error("❌ No se pudo encontrar el usuario existente.")
        process.exit(1)
      }
      authData = { user: existing }
    } else {
      console.error("❌ Error al crear usuario Auth:", authError.message)
      process.exit(1)
    }
  }

  const userId = authData.user.id
  console.log(`✅ Usuario creado/encontrado: ${userId}`)
  console.log(`   Email: ${EMAIL}`)
  console.log(`   Password: ${PASSWORD}`)

  // 2. Verificar si ya tiene un negocio asociado
  const { data: existingBusiness } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", userId)
    .maybeSingle()

  if (existingBusiness) {
    console.log(`✅ Ya tiene negocio asociado: "${existingBusiness.name}" (${existingBusiness.id})`)
  } else {
    // 3. Crear negocio de demo
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .insert({
        name: "Restaurante Demo",
        slug: "restaurante-demo",
        description: "Negocio de prueba para el revisor de Google Play. Gastronomía típica del Valle de Calamuchita.",
        section: "gastronomy",
        type: "gastronomy",
        category: "restaurant",
        categories: [],
        address: "Av. San Martín 100, Villa General Belgrano",
        pueblo: "Villa General Belgrano",
        phone: "3546000000",
        whatsapp: "3546000000",
        offers_delivery: true,
        offers_takeaway: true,
        offers_dine_in: true,
        accepts_reservations: true,
        pet_friendly: false,
        payment_methods: ["efectivo", "debito", "credito", "mercadopago"],
        status: "active",
        is_open: true,
        owner_id: userId,
        medical_specialties: [],
        health_coverages: [],
        professionals: [],
        has_24h_guard: false,
      })
      .select("id, name")
      .single()

    if (bizError) {
      console.error("❌ Error al crear negocio:", bizError.message)
      process.exit(1)
    }

    console.log(`✅ Negocio creado: "${business.name}" (${business.id})`)
  }

  // 4. Verificar login
  console.log("\n🔐 Verificando login...")
  const anonKey = "sb_publishable__w_Lvs4OQhABxIQGPqTGZg_GnkiwIeD"
  const anonClient = createClient(SUPABASE_URL, anonKey)

  const { data: session, error: loginError } = await anonClient.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  })

  if (loginError) {
    console.error("❌ Error al hacer login:", loginError.message)
    process.exit(1)
  }

  console.log(`✅ Login exitoso. Token generado: ${session.session?.access_token?.slice(0, 30)}...`)

  // 5. Verificar que tiene acceso al dashboard
  const { data: { user } } = await anonClient.auth.getUser()
  const isBusinessRole = user?.user_metadata?.role === "business"
  console.log(`✅ Rol "business" en metadata: ${isBusinessRole}`)

  const { data: biz } = await anonClient
    .from("businesses")
    .select("id, name, status")
    .eq("owner_id", user.id)
    .eq("status", "active")
    .maybeSingle()

  if (biz) {
    console.log(`✅ Negocio activo encontrado: "${biz.name}"`)
    console.log("\n🎉 TODO OK. El revisor puede entrar al dashboard en /dashboard")
    console.log(`\n📋 Credenciales para el revisor:`)
    console.log(`   Email: ${EMAIL}`)
    console.log(`   Password: ${PASSWORD}`)
  } else {
    console.error("❌ No se encontró negocio activo para el usuario. Revisar RLS policies.")
  }

  await anonClient.auth.signOut()
}

main().catch(console.error)
