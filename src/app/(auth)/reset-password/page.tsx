import { Suspense } from "react"
import ResetPasswordForm from "@/components/auth/ResetPasswordForm"
import Link from "next/link"

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl text-stone-900 mb-2">Calamuchita App</h1>
        <p className="text-stone-500">El valle en tu bolsillo</p>
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8">
        <Suspense fallback={<p className="text-sm text-stone-400 text-center py-4">Cargando...</p>}>
          <ResetPasswordForm />
        </Suspense>
        <p className="text-center text-sm text-stone-500 mt-6">
          <Link href="/login" className="text-primary-500 hover:text-primary-600 font-medium">
            Volver al login
          </Link>
        </p>
      </div>
    </div>
  )
}
