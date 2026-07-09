import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Phone, MessageCircle, Sparkles, Trophy, Users, ShieldCheck } from "lucide-react";
import { TenantGate } from "@/components/site/TenantGate";
import { StoragedImage } from "@/components/site/StoragedImage";
import { useTenant } from "@/lib/tenant-context";
import { feePlansQuery, sectionsBy, sectionOne, siteContentQuery } from "@/lib/site-queries";
import { signedUrl } from "@/lib/storage";
import { niche } from "@/lib/niche";

export const Route = createFileRoute("/")({
  component: HomeRoute,
});

function HomeRoute() {
  return (
    <TenantGate>
      <HomeContent />
    </TenantGate>
  );
}

type Hero = {
  headline?: string;
  subheadline?: string;
  cta_label?: string;
  background_url?: string;
  background_type?: "image" | "video";
};
type StarPlayer = { name: string; achievement: string; photo_url?: string | null };
type Spotlight = { name: string; role?: string; bio?: string; photo_url?: string | null };

/** Resolves a `tenant-assets` storage path (or absolute URL) to a signed URL. */
function useResolvedMediaUrl(path?: string | null) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!path) { setUrl(""); return; }
    if (path.startsWith("http")) { setUrl(path); return; }
    let active = true;
    signedUrl(path).then((u) => { if (active) setUrl(u); });
    return () => { active = false; };
  }, [path]);
  return url;
}

function HomeContent() {
  const tenant = useTenant();
  const { data: sections = [] } = useQuery(siteContentQuery(tenant.id));
  const { data: fees = [] } = useQuery(feePlansQuery(tenant.id));
  const hero = sectionOne<Hero>(sections, "hero");
  const stars = sectionsBy(sections, "star_players").map((s) => s.content as StarPlayer);
  const spotlights = sectionsBy(sections, "spotlight").map((s) => s.content as Spotlight);
  const monthly = fees.filter((f) => f.type === "monthly").slice(0, 3);
  const words = niche(tenant.niche);

  const heroMediaUrl = useResolvedMediaUrl(hero?.background_url);
  const hasHeroMedia = Boolean(hero?.background_url && heroMediaUrl);

  const wa = tenant.whatsapp?.replace(/[^\d]/g, "");

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-neutral-950">
        {hasHeroMedia ? (
          hero?.background_type === "video" ? (
            <video
              src={heroMediaUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <img
              src={heroMediaUrl}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
          )
        ) : (
          /* No custom background uploaded yet — rich brand-colored mesh, never a stock/niche photo */
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${tenant.primary_color}, ${tenant.secondary_color})` }}
            />
            <div
              className="absolute -top-32 -left-16 h-[480px] w-[480px] rounded-full opacity-50 blur-[130px]"
              style={{ backgroundColor: tenant.secondary_color }}
            />
            <div
              className="absolute top-1/3 -right-24 h-[420px] w-[420px] rounded-full opacity-40 blur-[120px]"
              style={{ backgroundColor: "#ffffff" }}
            />
            <div
              className="absolute -bottom-40 left-1/4 h-[440px] w-[440px] rounded-full opacity-30 blur-[130px]"
              style={{ backgroundColor: tenant.primary_color }}
            />
          </div>
        )}
        {/* Cinematic gradient overlays for legibility */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(3,7,18,0.92) 0%, rgba(3,7,18,0.72) 38%, rgba(3,7,18,0.25) 65%, rgba(3,7,18,0) 100%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
        {/* Brand tint glow */}
        <div
          className="pointer-events-none absolute -top-40 -left-20 h-[520px] w-[520px] rounded-full opacity-40 blur-[140px]"
          style={{ backgroundColor: tenant.primary_color }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28 lg:py-32">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {words.label}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              {hero?.headline ?? tenant.tagline ?? tenant.name}
            </motion.h1>
            {hero?.subheadline ? (
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12 }}
                className="mt-6 max-w-2xl text-lg text-white/85 sm:text-xl"
              >
                {hero.subheadline}
              </motion.p>
            ) : null}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-10 flex flex-wrap gap-3"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] transition-transform hover:scale-[1.02]"
              >
                {hero?.cta_label ?? "Register Now"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {tenant.phone ? (
                <a
                  href={`tel:${tenant.phone}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
                >
                  <Phone className="h-4 w-4" />
                  Call us
                </a>
              ) : null}
            </motion.div>
          </div>

          {/* Glass stat row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="relative mt-14 grid gap-3 sm:mt-20 sm:grid-cols-3"
          >
            {[
              { icon: Users, label: "Certified coaches", value: "Trained mentors" },
              { icon: Trophy, label: "Structured training", value: "Skill-first curriculum" },
              { icon: ShieldCheck, label: "Transparent fees", value: "No surprises" },
            ].map((s) => (
              <div
                key={s.label}
                className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl transition-transform hover:-translate-y-0.5"
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl transition-opacity group-hover:opacity-70" />
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-white ring-1 ring-white/25">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-widest text-white/70">{s.label}</div>
                    <div className="text-sm font-semibold text-white">{s.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>



      {/* Spotlight — one big highlighted profile */}
      {spotlights.map((p, i) => (
        <section key={i} className="bg-background py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div
              className={`grid items-center gap-8 overflow-hidden rounded-3xl border border-border/60 bg-card md:grid-cols-2 ${
                i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="relative aspect-[4/3] w-full md:aspect-auto md:h-full md:min-h-[420px]">
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(135deg, ${tenant.primary_color}, ${tenant.secondary_color})` }}
                />
                <StoragedImage
                  path={p.photo_url}
                  alt={p.name}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                  fallback={
                    <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-white/80">
                      {p.name.charAt(0)}
                    </div>
                  }
                />
              </div>
              <div className="p-8 sm:p-10">
                <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--brand)" }}>
                  Spotlight
                </div>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{p.name}</h2>
                {p.role ? <div className="mt-2 text-sm font-medium text-muted-foreground">{p.role}</div> : null}
                {p.bio ? <p className="mt-5 text-base leading-relaxed text-muted-foreground">{p.bio}</p> : null}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Star players */}
      {stars.length > 0 ? (
        <section className="bg-muted/30 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--brand)" }}>
                  Our champions
                </div>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Star players
                </h2>
              </div>
              <Link to="/star-players" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline">
                See all →
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stars.slice(0, 3).map((p, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-shadow hover:shadow-lg"
                >
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-xl text-xl font-bold text-white"
                    style={{ backgroundColor: "var(--brand)" }}
                  >
                    {p.name.charAt(0)}
                  </div>
                  <div className="mt-4 text-base font-semibold text-foreground">{p.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{p.achievement}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Fee plans preview */}
      {monthly.length > 0 ? (
        <section className="bg-background py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--brand)" }}>
                Simple pricing
              </div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Monthly plans</h2>
              <p className="mt-3 text-muted-foreground">Choose what fits. See all plans and one-time fees on the fees page.</p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {monthly.map((p) => (
                <div key={p.id} className="rounded-2xl border border-border/60 bg-card p-6">
                  <div className="text-sm font-medium text-muted-foreground">{p.name}</div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">₹{p.amount.toLocaleString("en-IN")}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  {p.description ? <p className="mt-3 text-sm text-muted-foreground">{p.description}</p> : null}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link to="/fees" className="text-sm font-medium" style={{ color: "var(--brand)" }}>
                View all fees →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Brand-colored CTA band */}
      <section className="relative w-full overflow-hidden bg-neutral-950">
        <div className="relative h-[380px] w-full sm:h-[480px] lg:h-[540px]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${tenant.secondary_color}, ${tenant.primary_color})` }}
          />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-white/10 blur-[130px]" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full bg-black/20 blur-[130px]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

          {/* Glass CTA card */}
          <div className="relative z-10 flex h-full items-center justify-center px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="w-full max-w-2xl rounded-[24px] border border-white/15 bg-white/10 p-8 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-10"
              style={{ WebkitBackdropFilter: "blur(16px)" }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Join {tenant.name}?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">
                {hero?.subheadline ?? tenant.tagline ?? `Join ${tenant.name} and start your journey today.`}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: tenant.primary_color }}
                >
                  Register Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {wa ? (
                  <a
                    href={`https://wa.me/${wa}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Us
                  </a>
                ) : null}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
