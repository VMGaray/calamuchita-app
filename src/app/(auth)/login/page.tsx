import LoginForm from "@/components/auth/LoginForm"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl text-stone-900 mb-2">Calamuchita App</h1>
        <p className="text-stone-500">El valle en tu bolsillo</p>
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 p-8">
        <h2 className="text-xl text-stone-800 mb-6">Iniciá sesión</h2>
        <LoginForm />
        <p className="text-center text-sm text-stone-500 mt-6">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="text-primary-500 hover:text-primary-600 font-medium">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}