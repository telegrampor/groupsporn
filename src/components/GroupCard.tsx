import Link from 'next/link'
import Image from 'next/image'

interface GroupCardProps {
  href: string
  title: string
  category: string
  image?: string | null
  count?: number
  isNew?: boolean
  rank?: number
}

export function GroupCard({ href, title, category, image, count, isNew, rank }: GroupCardProps) {
  return (
    <Link
      href={href}
      className="block glass rounded-2xl overflow-hidden hover-glow transition-all duration-300 hover:scale-[1.03] group"
    >
      {/* Image area */}
      <div className="aspect-square relative overflow-hidden bg-[#1a1a1a]">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#2d1b69]" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* Rank badge */}
        {rank !== undefined && (
          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#b31b1b] flex items-center justify-center text-white text-[11px] font-black">
            {rank}
          </div>
        )}

        {/* New badge */}
        {isNew && !rank && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 rounded-full bg-[#b31b1b]/90 text-white text-[10px] font-bold uppercase tracking-wide">
              New
            </span>
          </div>
        )}

        {/* Title over image */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-lg">
            {title}
          </h3>
        </div>
      </div>

      {/* Card footer */}
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <span className="text-[10px] text-[#999] font-medium uppercase tracking-wide truncate">
          {category}
        </span>
        {count !== undefined && count > 0 && (
          <span className="text-[10px] text-[#999] flex items-center gap-1 shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
            {count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K` : count}
          </span>
        )}
      </div>
    </Link>
  )
}
