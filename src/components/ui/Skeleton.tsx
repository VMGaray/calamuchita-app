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

export function SkeletonDetalle() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-72 md:h-96 bg-stone-200" />
      <div className="max-w-4xl mx-auto px-4 pt-16 pb-12">
        <div className="h-8 bg-stone-200 rounded-full w-64 mb-3" />
        <div className="flex gap-2 mb-8">
          <div className="h-6 bg-stone-100 rounded-full w-24" />
          <div className="h-6 bg-stone-100 rounded-full w-16" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
              <div className="h-4 bg-stone-100 rounded-full w-full" />
              <div className="h-4 bg-stone-100 rounded-full w-5/6" />
              <div className="h-4 bg-stone-100 rounded-full w-4/6" />
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
              <div className="h-5 bg-stone-200 rounded-full w-32 mb-4" />
              {[1,2,3,4].map(i => (
                <div key={i} className="flex justify-between py-2 border-b border-stone-100">
                  <div className="h-4 bg-stone-100 rounded-full w-40" />
                  <div className="h-4 bg-stone-100 rounded-full w-20" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
              <div className="h-4 bg-stone-200 rounded-full w-24 mb-3" />
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-stone-100 rounded-xl flex-shrink-0" />
                  <div className="h-4 bg-stone-100 rounded-full flex-1" />
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-2">
              <div className="h-4 bg-stone-200 rounded-full w-20 mb-3" />
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 bg-stone-100 rounded-full w-20" />
                  <div className="h-3 bg-stone-100 rounded-full w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-stone-200 rounded-full w-48 mb-2" />
      <div className="h-4 bg-stone-100 rounded-full w-64 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-stone-100 rounded-xl" />
              <div className="h-3 bg-stone-100 rounded-full w-24" />
            </div>
            <div className="h-8 bg-stone-200 rounded-full w-16" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <div className="h-4 bg-stone-200 rounded-full w-32 mb-4" />
        {[1,2,3].map(i => (
          <div key={i} className="flex justify-between py-3 border-b border-stone-100">
            <div className="h-4 bg-stone-100 rounded-full w-32" />
            <div className="h-4 bg-stone-100 rounded-full w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-stone-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-stone-100 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-stone-200 rounded-full w-40" />
            <div className="h-3 bg-stone-100 rounded-full w-24" />
          </div>
          <div className="h-6 bg-stone-100 rounded-full w-20" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonCarta() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1,2].map(cat => (
        <div key={cat} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="w-4 h-4 bg-stone-100 rounded" />
            <div className="h-4 bg-stone-200 rounded-full w-32 flex-1" />
            <div className="h-6 bg-stone-100 rounded-full w-16" />
          </div>
          <div className="border-t border-stone-100 divide-y divide-stone-100">
            {[1,2,3].map(item => (
              <div key={item} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-stone-100 rounded-full w-40" />
                  <div className="h-3 bg-stone-100 rounded-full w-56" />
                </div>
                <div className="h-4 bg-stone-100 rounded-full w-16" />
                <div className="h-6 bg-stone-100 rounded-full w-20" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}