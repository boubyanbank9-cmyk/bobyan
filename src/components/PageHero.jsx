export default function PageHero({ title, subtitle }) {
  return (
    <section className="page-hero-gradient text-white py-16 md:py-20 text-center">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-black mb-3">{title}</h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-white/80 font-medium">{subtitle}</p>
        )}
      </div>
    </section>
  )
}
