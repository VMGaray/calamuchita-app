export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 animate-pulse">
      <div className="h-36 bg-stone-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-stone-200 rounded-full w-3/4" />
        <div className="h-3 bg-stone-100 rounded-full w-1/2" />
        <div className="h-3 bg-stone-100 rounded-full w-full" />
        <div className="flex gap-2 pt-1">
          <div className="h-5 bg-stone-100 rounded-full w-16" />
          <div className="h-5 bg-stone-100 rounded-full w-12" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonCategoryCard() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200 animate-pulse">
      <div className="w-12 h-12 bg-stone-200 rounded-xl mb-3" />
      <div className="h-4 bg-stone-200 rounded-full w-2/3 mb-2" />
      <div className="h-3 bg-stone-100 rounded-full w-full" />
    </div>
  )
}

export function SkeletonHero() {
  return (
    <div className="bg-primary-500 px-4 py-16 text-center animate-pulse">
      <div className="h-6 bg-primary-400 rounded-full w-48 mx-auto mb-5" />
      <div className="h-14 bg-primary-400 rounded-2xl w-96 mx-auto mb-3" />
      <div className="h-14 bg-primary-400 rounded-2xl w-72 mx-auto mb-6" />
      <div className="h-4 bg-primary-400 rounded-full w-80 mx-auto mb-2" />
      <div className="h-4 bg-primary-400 rounded-full w-64 mx-auto mb-8" />
      <div className="h-14 bg-primary-400 rounded-2xl w-full max-w-md mx-auto" />
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCategoryCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonBusinessGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}