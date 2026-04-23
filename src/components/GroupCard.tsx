import Link from 'next/link'
import Image from 'next/image'

interface GroupCardProps {
  href:        string
  title:       string
  category:    string
  image?:      string | null
  count?:      number          // member count
  viewCount?:  number          // view count
  isNew?:      boolean
  isFeatured?: boolean
  rank?:       number
  ctaLabel?:   string          // "🚀 Join" | "🤖 Use Bot"
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
  return String(n)
}

export function GroupCard({
  href, title, category, image, count, viewCount,
  isNew, isFeatured, rank, ctaLabel = '🚀 Join',
}: GroupCardProps) {
  // Featured cards get a golden glow border — matches erogram.pro DOM
  const wrapperClass = isFeatured
    ? 'glass rounded-2xl sm:rounded-3xl overflow-hidden h-full flex flex-col backdrop-blur-xl border transition-all duration-500 group border-yellow-500/50 shadow-[0_0_20px_rgba(201,151,58,0.25)] hover:border-yellow-500/80 hover:shadow-[0_0_35px_rgba(201,151,58,0.4)]'
    : 'glass rounded-2xl sm:rounded-3xl overflow-hidden h-full flex flex-col backdrop-blur-xl border transition-all duration-500 group border-white/5 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50'

  return (
    <Link href={href} className={wrapperClass}>

      {/* ── Image area ─────────────────────────────── */}
      <div className="relative w-full h-32 sm:h-52 overflow-hidden bg-[#1a1a1a]">

        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#2d1b69]" />
        )}

        {/* Gradient overlay — exact from-[#0a0a0a] as in original */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />

        {/* Stats badges — top left, black pill with backdrop-blur */}
        <div className="absolute top-2 left-2 flex gap-1 z-10">
          {rank !== undefined ? (
            <span className="bg-black/70 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg text-white text-[10px] font-black">
              #{rank}
            </span>
          ) : null}
          {viewCount !== undefined && viewCount > 0 && (
            <span className="bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1 text-white text-[10px]">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              {fmt(viewCount)}
            </span>
          )}
          {count !== undefined && count > 0 && (
            <span className="bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1 text-white text-[10px]">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              {fmt(count)}
            </span>
          )}
        </div>

        {/* New badge — top right */}
        {isNew && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg uppercase tracking-wider">
              New
            </span>
          </div>
        )}

        {/* Title at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-lg">
            {title}
          </h3>
        </div>
      </div>

      {/* ── Card body ──────────────────────────────── */}
      <div className="p-3 sm:p-4 flex flex-col gap-2.5 flex-1">

        {/* Category pill */}
        <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-white/5 border border-white/5 text-gray-300 text-[10px] sm:text-xs font-medium self-start">
          {category}
        </span>

        {/* CTA — blue-to-purple gradient, matches original exactly */}
        <div className="group/btn relative flex items-center justify-center w-full overflow-hidden rounded-xl py-2.5 sm:py-3.5 px-3 sm:px-4 font-black text-white text-sm shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/40 mt-auto">
          {ctaLabel}
        </div>

      </div>
    </Link>
  )
}
