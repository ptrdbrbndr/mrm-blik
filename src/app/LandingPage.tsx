'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import FloatingHearts, { heartPath } from '@/components/FloatingHearts'
import AnimatedCounter from '@/components/AnimatedCounter'

const principles = [
  { icon: "\u{1F54A}\uFE0F", title: "Vrijheid", desc: "Laat los wat niet meer dient en maak ruimte voor echte verbinding." },
  { icon: "\u{1F64F}", title: "Radicale Aanvaarding", desc: "Omarm jezelf en de ander volledig, zonder oordeel of verwachting." },
  { icon: "\u2728", title: "Essentie", desc: "Ontdek wie je ten diepste bent en trek vanuit die kern je ideale partner aan." },
  { icon: "\u{1F30A}", title: "Doelloosheid", desc: "Stop met zoeken vanuit tekort. Laat de liefde naar je toe komen." },
  { icon: "\u{1F4AB}", title: "Eenheid", desc: "Ervaar dat je al verbonden bent met alles en iedereen om je heen." },
]

const steps = [
  { num: "01", title: "Ontdek jezelf", desc: "Vul je VREDE-profiel in. Geen oppervlakkige vragen, maar een diepgaande verkenning van je waarden, dromen en essentie.", emoji: "\u{1F50D}" },
  { num: "02", title: "Miracle Matching", desc: "Ons algoritme matcht op zielsniveau. Niet op uiterlijk of hobby\u2019s, maar op innerlijke frequentie en persoonlijke groei.", emoji: "\u2728" },
  { num: "03", title: "Verbind in een Cirkel", desc: "Ontmoet je matches in een veilige Miracle Cirkel, begeleid door een ervaren mentor. Precies zoals in Miracle Roadmap.", emoji: "\u{1F91D}" },
  { num: "04", title: "Groei samen", desc: "Volg samen het 100-dagen pad van angst naar liefde. Bouw een relatie op een fundament van vrede en vertrouwen.", emoji: "\u{1F331}" },
]

const testimonials = [
  { name: "Sanne & Mark", quote: "We ontmoetten elkaar in onze Miracle Cirkel. Wat begon als een veilige plek om te delen, groeide uit tot de mooiste relatie die we ooit hebben gehad." },
  { name: "Kim", quote: "Na jaren zoeken op dating-apps voelde dit eindelijk als thuiskomen. Hier word je gezien om wie je \u00E9cht bent, niet om je profielfoto." },
  { name: "Thomas & Lisa", quote: "De VREDE-matching werkt. We zijn allebei enorm gegroeid en hebben een relatie gebouwd op echte verbinding, niet op oppervlakkigheid." },
]

function HeartIcon({ className = "w-5 h-5", fill = "currentColor" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ fill }}>
      <path d={heartPath} />
    </svg>
  )
}

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [email, setEmail] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div>
      {/* Grain overlay */}
      <div
        className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
          scrolled ? 'bg-cream/97 backdrop-blur-xl shadow-[0_2px_20px_rgba(45,42,38,0.08)]' : ''
        }`}
        style={{ padding: scrolled ? '12px 0' : '20px 0' }}
        data-testid="nav"
      >
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" data-testid="nav-logo">
            <HeartIcon className="w-7 h-7" fill="#7A2E4A" />
            <div>
              <span className="font-heading font-bold text-lg text-deep-brown">Miracle</span>
              <span className="font-sans text-sm text-rose ml-1">Relationship Matcher</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 font-sans text-sm font-medium">
            <a href="#hoe" className="text-deep-brown hover:text-burgundy transition-colors" data-testid="nav-how">Hoe het werkt</a>
            <a href="#vrede" className="text-deep-brown hover:text-burgundy transition-colors" data-testid="nav-vrede">VREDE Principes</a>
            <a href="#verhalen" className="text-deep-brown hover:text-burgundy transition-colors" data-testid="nav-stories">Verhalen</a>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-burgundy to-rose text-white rounded-full text-sm font-semibold shadow-[0_4px_20px_rgba(122,46,74,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(122,46,74,0.4)] transition-all"
              data-testid="cta-login"
            >
              Start je reis
            </Link>
          </div>

          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            data-testid="mobile-menu-button"
          >
            <div className={`w-6 h-0.5 bg-deep-brown rounded transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <div className={`w-6 h-0.5 bg-deep-brown rounded transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-6 h-0.5 bg-deep-brown rounded transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-cream border-t border-sand px-6 py-4 flex flex-col gap-4 font-sans text-sm">
            <a href="#hoe" className="text-deep-brown" onClick={() => setMenuOpen(false)}>Hoe het werkt</a>
            <a href="#vrede" className="text-deep-brown" onClick={() => setMenuOpen(false)}>VREDE Principes</a>
            <a href="#verhalen" className="text-deep-brown" onClick={() => setMenuOpen(false)}>Verhalen</a>
            <Link href="/login" className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-br from-burgundy to-rose text-white rounded-full font-semibold" onClick={() => setMenuOpen(false)}>
              Start je reis
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(165deg, #FBF8F4 0%, #F0E6DA 30%, #E8D5C4 60%, #E8C4D0 100%)',
        }}
        data-testid="hero-section"
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 70% 20%, rgba(196,151,59,0.08) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(122,46,74,0.06) 0%, transparent 50%)',
          }}
        />
        <FloatingHearts />

        <div className="relative z-10 text-center max-w-[800px] px-6 pt-32 pb-20">
          <div
            className="inline-flex items-center gap-2 bg-burgundy/8 rounded-full px-5 py-2 mb-8 font-sans text-xs font-semibold text-burgundy uppercase tracking-wider"
            data-testid="hero-badge"
          >
            <HeartIcon className="w-3.5 h-3.5" fill="#7A2E4A" />
            Onderdeel van Miracle Roadmap
          </div>

          <h1
            className="font-heading text-5xl md:text-[56px] font-bold leading-[1.15] text-deep-brown mb-6"
            style={{ animation: 'fadeInUp 0.8s ease-out' }}
            data-testid="hero-title"
          >
            Vind je{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(90deg, #C4973B, #E8D5A8, #C4973B)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'shimmer 4s ease-in-out infinite',
              }}
            >
              miracle match
            </span>
            <br />
            vanuit innerlijke vrede
          </h1>

          <p
            className="font-sans text-lg md:text-xl leading-relaxed text-earth max-w-[600px] mx-auto mb-10"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}
            data-testid="hero-subtitle"
          >
            De eerste dating app die matcht op zielsniveau. Gebaseerd op het
            VREDE-model van 365 Dagen Succesvol. Geen oppervlakkig swipen,
            maar diepe verbinding.
          </p>

          <div
            className="flex gap-4 justify-center flex-wrap"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.4s both' }}
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-10 py-4.5 bg-gradient-to-br from-burgundy to-rose text-white rounded-full text-[17px] font-semibold shadow-[0_4px_20px_rgba(122,46,74,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(122,46,74,0.4)] transition-all"
              data-testid="cta-dashboard"
            >
              <HeartIcon className="w-5 h-5" fill="white" />
              Ontdek je match
            </Link>
            <a
              href="#hoe"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-transparent text-burgundy border-2 border-burgundy rounded-full text-[15px] font-semibold hover:bg-burgundy hover:text-white transition-all"
              data-testid="cta-how"
            >
              Bekijk hoe het werkt
            </a>
          </div>

          <div
            className="flex justify-center gap-12 mt-16 font-sans"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.6s both' }}
          >
            {[
              { val: 14000, suffix: "+", label: "Miracle deelnemers" },
              { val: 2800, suffix: "+", label: "Matches gemaakt" },
              { val: 94, suffix: "%", label: "Tevreden matches" },
            ].map((s, i) => (
              <div key={i} className="text-center" data-testid={`stat-${i}`}>
                <div className="text-3xl font-bold font-heading text-burgundy">
                  <AnimatedCounter end={s.val} suffix={s.suffix} />
                </div>
                <div className="text-xs text-earth mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Stripe */}
      <div className="bg-burgundy py-7 px-6 text-center" data-testid="quote-stripe">
        <p className="font-heading italic text-lg text-blush leading-relaxed max-w-3xl mx-auto">
          &ldquo;Als iedereen in vrede leeft met zichzelf, is er vanzelf wereldvrede &mdash; en dat begint bij jouw relaties.&rdquo;
        </p>
        <span className="block mt-2 not-italic text-xs font-sans text-soft-rose uppercase tracking-widest">
          David de Kock &amp; Arjan Vergeer
        </span>
      </div>

      {/* How It Works */}
      <section id="hoe" className="py-24 px-6 bg-cream" data-testid="how-section">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-18">
            <div className="w-15 h-[3px] bg-gradient-to-r from-burgundy to-gold rounded-full mx-auto mb-6" />
            <h2 className="font-heading text-4xl font-bold text-deep-brown mb-4" data-testid="feature-create">
              Hoe Miracle Matching werkt
            </h2>
            <p className="font-sans text-[17px] text-earth max-w-[550px] mx-auto">
              Vier stappen van zelfontdekking naar diepe verbinding. Jouw pad naar een relatie die &eacute;cht klopt.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div
                key={i}
                className="bg-white rounded-[20px] p-10 pb-8 relative overflow-hidden border border-sand/60 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(45,42,38,0.12)] transition-all duration-400"
                data-testid={`step-${i}`}
              >
                <div className="absolute -top-2.5 -right-1 font-heading text-7xl font-bold leading-none" style={{ color: 'transparent', WebkitTextStroke: '1.5px #E8C4D0' }}>
                  {step.num}
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-blush to-soft-rose flex items-center justify-center mb-5 text-xl">
                    {step.emoji}
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-deep-brown mb-3">{step.title}</h3>
                  <p className="font-sans text-sm leading-relaxed text-earth">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VREDE Principles */}
      <section
        id="vrede"
        className="py-24 px-6 relative"
        style={{ background: 'linear-gradient(180deg, #F5F0E8 0%, #FBF8F4 100%)' }}
        data-testid="vrede-section"
      >
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <div className="w-15 h-[3px] bg-gradient-to-r from-burgundy to-gold rounded-full mx-auto mb-6" />
            <h2 className="font-heading text-4xl font-bold text-deep-brown mb-4" data-testid="feature-swipe">
              Matching op basis van <span className="text-burgundy">VREDE</span>
            </h2>
            <p className="font-sans text-[17px] text-earth max-w-[580px] mx-auto">
              Ons matching-algoritme is gebouwd op de vijf principes van innerlijke vrede.
              Hoe meer je in balans bent, hoe beter je matches.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-12 flex-wrap">
            {principles.map((p, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full border-2 border-blush font-sans text-sm font-semibold cursor-pointer transition-all ${
                  activeTab === i
                    ? 'bg-gradient-to-br from-burgundy to-rose text-white border-transparent'
                    : 'bg-white text-burgundy hover:bg-blush/20'
                }`}
                data-testid={`tab-${i}`}
              >
                {p.icon} {p.title}
              </button>
            ))}
          </div>

          {/* Active Principle Card */}
          <div
            className="bg-white rounded-3xl p-14 max-w-[700px] mx-auto text-center shadow-[0_8px_40px_rgba(45,42,38,0.06)] border border-sand/50 relative overflow-hidden"
            data-testid="principle-card"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-burgundy via-gold to-rose" />
            <div className="text-6xl mb-5" style={{ animation: 'gentleBounce 3s ease-in-out infinite' }}>
              {principles[activeTab].icon}
            </div>
            <h3 className="font-heading text-3xl font-bold text-burgundy mb-4">
              {principles[activeTab].title}
            </h3>
            <p className="font-sans text-[17px] leading-relaxed text-earth max-w-[480px] mx-auto">
              {principles[activeTab].desc}
            </p>
            <div className="mt-8 inline-block px-7 py-4 bg-warm-white rounded-[14px] font-sans text-sm text-earth">
              <span className="text-burgundy font-semibold">In je profiel:</span> Je beantwoordt vragen die meten hoe sterk dit principe bij je leeft
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight — Miracle Cirkel */}
      <section className="py-24 px-6 bg-cream" data-testid="cirkel-section">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-gold/10 rounded-full px-4 py-1.5 mb-6 font-sans text-xs font-semibold text-gold uppercase tracking-wider">
              {"\u2728"} Uniek concept
            </div>
            <h2 className="font-heading text-4xl font-bold text-deep-brown mb-5 leading-tight" data-testid="feature-results">
              Ontmoet je match in een <span className="text-burgundy">Miracle Cirkel</span>
            </h2>
            <p className="font-sans text-base leading-relaxed text-earth mb-7">
              Geen awkward eerste dates. In de Miracle Relationship Matcher ontmoet je potenti&euml;le
              partners in een warme groep van 6-8 gelijkgestemden, begeleid door een ervaren mentor.
              Precies zoals duizenden deelnemers het al ervaren bij Miracle Roadmap.
            </p>
            <div className="flex flex-col gap-4">
              {[
                "Veilige setting met mentorbegeleiding",
                "Ontmoet 6-8 matches per cirkel",
                "Wekelijkse online en maandelijkse live sessies",
                "Van oppervlakkig naar diep in je eigen tempo",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 font-sans text-[15px] text-deep-brown">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blush to-soft-rose flex items-center justify-center shrink-0 text-xs">
                    {"\u2713"}
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-[28px] p-12 relative overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #F5F0E8, #E8C4D0)' }}
          >
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(196,151,59,0.1), transparent 60%)' }} />
            <div className="relative z-10">
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {["S", "M", "K", "T", "A", "L"].map((letter, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 rounded-full flex items-center justify-center font-heading font-semibold text-[22px] shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                    style={{
                      background: i === 0 ? 'linear-gradient(135deg, #7A2E4A, #A0526B)' : 'white',
                      color: i === 0 ? 'white' : '#7A2E4A',
                      animation: `gentleBounce 3s ease-in-out ${i * 0.3}s infinite`,
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto font-sans font-bold text-[11px] text-white uppercase tracking-wider text-center leading-tight"
                style={{
                  background: 'linear-gradient(135deg, #C4973B, #E8D5A8)',
                  boxShadow: '0 4px 20px rgba(196,151,59,0.3)',
                }}
              >
                Mentor
              </div>
              <p className="text-center mt-6 font-sans text-sm text-earth italic">
                Jouw Miracle Cirkel &mdash; een veilige plek waar liefde begint
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="verhalen"
        className="py-24 px-6"
        style={{ background: 'linear-gradient(180deg, #F5F0E8, #FBF8F4)' }}
        data-testid="testimonials-section"
      >
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <div className="w-15 h-[3px] bg-gradient-to-r from-burgundy to-gold rounded-full mx-auto mb-6" />
            <h2 className="font-heading text-4xl font-bold text-deep-brown mb-4">
              Deelnemers aan het woord
            </h2>
            <p className="font-sans text-[17px] text-earth">
              Ontdek hoe Miracle Matching levens heeft veranderd
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-[20px] p-10 relative overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(45,42,38,0.12)] transition-all duration-400"
                data-testid={`testimonial-${i}`}
              >
                <div className="absolute top-4 left-6 font-heading text-[120px] leading-none text-blush/40">&ldquo;</div>
                <div className="relative z-10">
                  <div className="mb-5 text-gold">
                    {"\u2B50\u2B50\u2B50\u2B50\u2B50"}
                  </div>
                  <p className="font-heading italic text-base leading-relaxed text-deep-brown mb-6">
                    {t.quote}
                  </p>
                  <div className="flex items-center gap-3 pt-5 border-t border-sand">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${['#7A2E4A', '#A0526B', '#C4973B'][i]}, ${['#A0526B', '#C4899E', '#E8D5A8'][i]})`,
                      }}
                    >
                      <HeartIcon className="w-5 h-5" fill="white" />
                    </div>
                    <div>
                      <div className="font-sans font-semibold text-[15px] text-deep-brown">{t.name}</div>
                      <div className="font-sans text-xs text-earth">Miracle Matcher deelnemer</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-24 px-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(165deg, #7A2E4A 0%, #5E1E38 100%)' }}
        data-testid="cta-section"
      >
        <FloatingHearts />
        <div className="relative z-10 max-w-[640px] mx-auto text-center">
          <div className="text-5xl mb-6">{"\u{1F495}"}</div>
          <h2 className="font-heading text-4xl font-bold text-white mb-5 leading-tight">
            Ben jij klaar om je<br />miracle match te ontmoeten?
          </h2>
          <p className="font-sans text-[17px] leading-relaxed text-blush mb-10">
            Meld je aan voor de wachtlijst en wees als eerste op de hoogte als de Miracle Relationship Matcher live gaat.
            Vroege aanmelders ontvangen exclusieve toegang.
          </p>

          <div className="flex gap-3 max-w-[480px] mx-auto flex-wrap justify-center">
            <input
              type="email"
              placeholder="Jouw e-mailadres"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 min-w-[240px] px-6 py-4 rounded-full border-2 border-white/20 bg-white/10 text-white font-sans text-[15px] outline-none placeholder:text-white/40 focus:border-rose"
              data-testid="cta-email"
            />
            <button
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-sans text-base font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #C4973B, #D4A94C)',
                boxShadow: '0 4px 20px rgba(196,151,59,0.4)',
              }}
              data-testid="cta-submit"
            >
              Ja, ik wil dit! &rarr;
            </button>
          </div>

          <p className="font-sans text-xs text-soft-rose/80 mt-4">
            100% privacy. Geen spam. Je kunt je altijd uitschrijven.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-brown py-14 px-6" data-testid="footer">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex justify-between items-start flex-wrap gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <HeartIcon className="w-6 h-6" fill="#A0526B" />
                <span className="font-heading font-bold text-lg text-white">
                  Miracle Relationship Matcher
                </span>
              </div>
              <p className="font-sans text-sm text-earth max-w-[300px] leading-relaxed">
                Een initiatief van 365 Dagen Succesvol.
                Matching vanuit innerlijke vrede, niet vanuit tekort.
              </p>
            </div>

            <div className="flex gap-12 flex-wrap">
              {[
                { title: "Platform", links: ["Hoe het werkt", "VREDE Principes", "Miracle Cirkels", "Pricing"] },
                { title: "365 Familie", links: ["Miracle Roadmap", "Peace of Mind", "Superrelatie Event", "Podcast"] },
                { title: "Support", links: ["Veelgestelde vragen", "Contact", "Privacy", "Voorwaarden"] },
              ].map((col, i) => (
                <div key={i}>
                  <h4 className="font-sans font-semibold text-xs text-soft-rose uppercase tracking-widest mb-4">
                    {col.title}
                  </h4>
                  {col.links.map((link, j) => (
                    <a key={j} href="#" className="block font-sans text-sm text-sand mb-2.5 hover:text-white transition-colors">
                      {link}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-earth/20 pt-6 flex justify-between items-center flex-wrap gap-3 font-sans text-xs text-earth">
            <span>&copy; 2026 Miracle Relationship Matcher &mdash; 365 Dagen Succesvol B.V.</span>
            <div className="flex items-center gap-1.5">
              Gemaakt met
              <HeartIcon className="w-3.5 h-3.5" fill="#A0526B" />
              vanuit innerlijke vrede
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
