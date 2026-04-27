import RegisterForm from "@/components/auth/RegisterForm"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl text-stone-900 mb-2">Calamuchita App</h1>
        <p className="text-stone-500">El valle en tu bolsillo</p>
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 p-8">
        <h2 className="text-xl text-stone-800 mb-6">Crear cuenta</h2>
        <RegisterForm />
        <p className="text-center text-sm text-stone-500 mt-6">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-primary-500 hover:text-primary-600 font-medium">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}