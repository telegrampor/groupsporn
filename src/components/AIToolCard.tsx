import Link from 'next/link'
import Image from 'next/image'

// Retro white card — exact design of erogram.pro /ainsfw page
// border-2 border-black + hard shadow [3px_3px_0_#000] expanding on hover

interface AIToolCardProps {
  href:      string
  title:     string
  category?: string
  image?:    string | null
  isNew?:    boolean
}

export function AIToolCard({ href, title, category, image, isNew }: AIToolCardProps) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl overflow-hidden h-full flex flex-col border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[5px_5px_0_#000] hover:-translate-y-0.5 transition-all duration-150 group"
    >
      {/* Image area */}
      <div className="relative w-full h-32 sm:h-36 overflow-hidden bg-gray-100 shrink-0">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
            <span className="text-4xl">✨</span>
          </div>
        )}

        {/* Category badge — blue retro pill */}
        {category && (
          <div className="absolute top-1.5 left-1.5">
            <span className="bg-blue-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-black/20">
              {category}
            </span>
          </div>
        )}

        {/* New badge */}
        {isNew && (
          <div className="absolute top-1.5 right-1.5">
            <span className="bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-black/20">
              New
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-2 sm:p-3 flex flex-col gap-2 flex-1">
        <h3 className="text-black font-bold text-xs sm:text-sm leading-tight line-clamp-2">
          {title}
        </h3>

        {/* Yellow retro CTA button */}
        <div className="bg-yellow-400 hover:bg-yellow-300 text-black text-[10px] sm:text-xs font-black uppercase tracking-widest text-center py-1.5 rounded border-2 border-yellow-500 shadow-[2px_2px_0_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all duration-75 mt-auto">
          Try Now →
        </div>
      </div>
    </Link>
  )
}
