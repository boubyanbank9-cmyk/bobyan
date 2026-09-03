export default function PageHeroRed({ title, subtitle, badge }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#120305] via-[#200508] to-[#2a080c] py-16 text-white md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.18),transparent_50%)]" />
      <div className="relative mx-auto max-w-4xl px-4 text-center">
        {badge && (
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-red-300">{badge}</p>
        )}
        <h1 className="text-3xl font-black leading-tight md:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-red-100/80 md:text-lg">{subtitle}</p>
        )}
      </div>
    </section>
  )
}
