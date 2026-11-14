"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import MascotSticker from "./MascotSticker";
import { usePreferences } from "./PreferencesProvider";
import { exploreContent, exploreRoutes, featureRoutes, feedbackUrl } from "@/lib/explore-content";

type ExplorePage = "home" | "about" | "features" | "faq" | "contact";

function useExplore() {
  const { locale } = usePreferences();
  return exploreContent[locale];
}

function ExploreFrame({ active, children }: { active: ExplorePage; children: ReactNode }) {
  const copy = useExplore();
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".explore-page");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const items = root.querySelectorAll<HTMLElement>(".explore-reveal");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -24px 0px", threshold: 0.08 });
    items.forEach((item) => observer.observe(item));
    root.classList.add("explore-motion-ready");
    return () => { observer.disconnect(); root.classList.remove("explore-motion-ready"); };
  }, [active]);
  return <main className="explore-page">
    <div className="explore-width">
      <div className="explore-breadcrumb"><Link href="/">{copy.nav.home}</Link><span aria-hidden="true">/</span>{active === "home" ? <strong>{copy.nav.explore}</strong> : <><Link href="/explore">{copy.nav.explore}</Link><span aria-hidden="true">/</span><strong>{copy.nav[active]}</strong></>}</div>
      <nav className="explore-local-nav" aria-label={copy.nav.explore}>
        {exploreRoutes.map((route) => <Link href={route.href} key={route.id} aria-current={active === route.id ? "page" : undefined}>{copy.nav[route.id]}</Link>)}
      </nav>
    </div>
    {children}
  </main>;
}

function ExploreRouteArt({ variant }: { variant: "home" | "about" | "guide" }) {
  return <div className={`explore-route-art explore-route-art-${variant}`} aria-hidden="true">
    <svg className="explore-route-line" viewBox="0 0 680 350" fill="none" preserveAspectRatio="xMidYMid meet"><path d="M40 286 C130 280 100 70 250 102 S400 320 520 188 S595 55 650 82" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 12"/><circle cx="44" cy="286" r="11"/><circle cx="252" cy="103" r="12"/><circle cx="517" cy="190" r="11"/><circle cx="648" cy="82" r="11"/></svg>
    <span className="explore-route-charm explore-charm-a">學</span><span className="explore-route-charm explore-charm-b">文</span><span className="explore-route-charm explore-charm-c">✦</span>
    <MascotSticker variant={variant === "about" ? "traveler" : "study"} decorative className="explore-route-bear" />
  </div>;
}

export function ExploreHome() {
  const copy = useExplore();
  return <ExploreFrame active="home">
    <section className="explore-hero explore-width explore-reveal">
      <div className="explore-hero-copy"><p className="explore-eyebrow">{copy.home.eyebrow}</p><h1>{copy.home.title}</h1><p>{copy.home.lead}</p><Link href="/explore/features" className="button-primary">{copy.home.intro} <span aria-hidden="true">↗</span></Link></div>
      <ExploreRouteArt variant="home" />
    </section>
    <section className="explore-width explore-entry-row explore-reveal" aria-label={copy.nav.explore}>
      <Link href="/explore/about"><span className="explore-entry-number">01 / 03</span><strong>{copy.home.about}</strong><span aria-hidden="true">↗</span></Link>
      <Link href="/explore/features"><span className="explore-entry-number">02 / 03</span><strong>{copy.home.features}</strong><span aria-hidden="true">↗</span></Link>
      <Link href="/explore/faq"><span className="explore-entry-number">03 / 03</span><strong>{copy.home.faq}</strong><span aria-hidden="true">↗</span></Link>
    </section>
  </ExploreFrame>;
}

export function ExploreAbout() {
  const copy = useExplore();
  return <ExploreFrame active="about">
    <section className="explore-width explore-about-hero explore-reveal"><div><p className="explore-eyebrow">{copy.about.eyebrow}</p><h1>{copy.about.title}</h1><p className="explore-lead">{copy.about.lead}</p></div><ExploreRouteArt variant="about" /></section>
    <section className="explore-width explore-principles" aria-label={copy.about.missionLabel}>
      <article className="explore-principle explore-reveal"><span>{copy.about.missionLabel}</span><h2>{copy.about.missionTitle}</h2><p>{copy.about.mission}</p></article>
      <article className="explore-principle explore-reveal"><span>{copy.about.methodLabel}</span><h2>{copy.about.methodTitle}</h2><p>{copy.about.method}</p></article>
    </section>
    <section className="explore-width explore-mascot-story explore-reveal"><MascotSticker variant="study" decorative className="explore-mascot-story-art" /><div><p className="explore-eyebrow">{copy.about.mascotLabel}</p><h2>{copy.about.mascotTitle}</h2><p>{copy.about.mascot}</p></div></section>
    <section className="explore-width explore-bio explore-reveal" aria-labelledby="explore-bio-title">
      <div className="explore-portrait"><Image src="/images/uyen-tran-profile.png" alt="Uyên Trần" width={1254} height={1254} sizes="(max-width: 720px) 85vw, 430px" quality={88} /></div>
      <div className="explore-bio-copy"><p className="explore-eyebrow">{copy.about.bioLabel}</p><h2 id="explore-bio-title">{copy.about.bioTitle}</h2><p>{copy.about.bio1}</p><p>{copy.about.bio2}</p><Link href="/explore/features" className="button-primary">{copy.about.next} <span aria-hidden="true">↗</span></Link></div>
    </section>
  </ExploreFrame>;
}

function FeatureWalkthrough({ steps, label, symbol }: { steps: readonly [string, string, string]; label: string; symbol: string }) {
  const [current, setCurrent] = useState(0);
  return <div className="explore-walkthrough">
    <div className="explore-walkthrough-top"><span className="explore-walkthrough-symbol" aria-hidden="true">{symbol}</span><span>{label}</span></div>
    <div className="explore-walkthrough-body" role="status" aria-live="polite"><span>0{current + 1}</span><p>{steps[current]}</p></div>
    <div className="explore-walkthrough-controls" role="group" aria-label={label}>{steps.map((_, index) => <button type="button" key={index} onClick={() => setCurrent(index)} aria-pressed={current === index} aria-label={`${label} ${index + 1}`}>0{index + 1}</button>)}</div>
  </div>;
}

export function ExploreFeatures() {
  const copy = useExplore();
  return <ExploreFrame active="features">
    <section className="explore-width explore-feature-intro explore-reveal"><div><p className="explore-eyebrow">{copy.guide.eyebrow}</p><h1>{copy.guide.title}</h1><p className="explore-lead">{copy.guide.lead}</p></div><MascotSticker variant="graduate" decorative className="explore-feature-bear" /></section>
    <section className="explore-width explore-start explore-reveal" aria-labelledby="explore-start-title"><div className="explore-start-head"><p className="explore-eyebrow">{copy.guide.startLabel}</p><h2 id="explore-start-title">{copy.guide.startTitle}</h2><p>{copy.guide.startLead}</p></div><ol>{copy.guide.startSteps.map((step, index) => <li key={index}><span>0{index + 1}</span>{step}</li>)}</ol></section>
    <div className="explore-width explore-availability"><p>{copy.guide.availability}</p><span className="explore-status explore-status-planned">{copy.common.planned}</span><p>{copy.guide.plannedNote}</p></div>
    <div className="explore-feature-list explore-width">
      {featureRoutes.map((feature, index) => {
        const item = copy.guide.features[index];
        const group = index === 0 ? 0 : index === 4 ? 1 : index === 7 ? 2 : null;
        return <div key={feature.id}>
          {group !== null && <h2 className="explore-chapter explore-reveal"><span>0{group + 1}</span>{copy.guide.sections[group]}</h2>}
          <section id={feature.id} className={`explore-feature-story explore-feature-${feature.id} ${index % 2 ? "is-reversed" : ""} explore-reveal`} aria-labelledby={`explore-${feature.id}-title`}>
            <div className="explore-feature-copy"><div className="explore-feature-meta"><span>0{index + 1} / 08</span><span className={`explore-status ${feature.status === "conditional" ? "explore-status-conditional" : ""}`}>{feature.status === "conditional" ? copy.common.conditional : copy.common.available}</span></div><h3 id={`explore-${feature.id}-title`}>{item.title}</h3><p>{item.purpose}</p><p className="explore-feature-audience"><strong>{copy.guide.audienceLabel}</strong> {item.audience}</p><Link href={feature.href} className="explore-feature-link">{item.action}<span aria-hidden="true">↗</span></Link></div>
            <FeatureWalkthrough steps={item.steps} label={copy.guide.howLabel} symbol={feature.symbol} />
          </section>
        </div>;
      })}
    </div>
  </ExploreFrame>;
}

function normalizeSearch(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase(); }

export function ExploreFaq() {
  const copy = useExplore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<keyof typeof copy.faq.categories>("all");
  const visible = useMemo(() => copy.faq.items.filter((item) => (category === "all" || item.category === category) && normalizeSearch(`${item.question} ${item.answer}`).includes(normalizeSearch(query.trim()))), [copy, query, category]);
  return <ExploreFrame active="faq">
    <section className="explore-width explore-faq-hero explore-reveal"><div><p className="explore-eyebrow">{copy.faq.eyebrow}</p><h1>{copy.faq.title}</h1><p className="explore-lead">{copy.faq.lead}</p></div><MascotSticker variant="puzzled" decorative className="explore-faq-bear" /></section>
    <section className="explore-width explore-faq-shell" aria-label={copy.faq.title}>
      <div className="explore-faq-tools"><label htmlFor="explore-faq-search">{copy.faq.searchLabel}</label><div className="explore-search"><span aria-hidden="true">⌕</span><input id="explore-faq-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.faq.search} autoComplete="off" /></div><div className="explore-faq-categories" role="group" aria-label={copy.faq.title}>{(Object.keys(copy.faq.categories) as (keyof typeof copy.faq.categories)[]).map((key) => <button type="button" key={key} onClick={() => setCategory(key)} aria-pressed={category === key}>{copy.faq.categories[key]}</button>)}</div></div>
      <div className="explore-faq-results" aria-live="polite">{visible.length ? visible.map((item) => <details className="explore-faq-item" key={item.question}><summary><span>{item.question}</span><span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>) : <div className="explore-no-results"><p>{copy.faq.noResults}</p><button type="button" onClick={() => { setQuery(""); setCategory("all"); }}>{copy.faq.clear}</button></div>}</div>
    </section>
    <section className="explore-width explore-help-strip explore-reveal"><div><h2>{copy.faq.helpTitle}</h2><p>{copy.faq.helpText}</p></div><Link href="/explore/contact" className="button-primary">{copy.nav.contact} <span aria-hidden="true">↗</span></Link></section>
  </ExploreFrame>;
}

export function ExploreContact() {
  const copy = useExplore();
  return <ExploreFrame active="contact">
    <section className="explore-width explore-contact-hero explore-reveal"><div><p className="explore-eyebrow">{copy.contact.eyebrow}</p><h1>{copy.contact.title}</h1><p className="explore-lead">{copy.contact.lead}</p></div><MascotSticker variant="boba" decorative className="explore-contact-bear" /></section>
    <section className="explore-width explore-contact-grid"><article className="explore-contact-main explore-reveal"><span className="explore-contact-icon" aria-hidden="true">✎</span><h2>{copy.contact.reportTitle}</h2><p>{copy.contact.reportBody}</p><ol>{copy.contact.reportSteps.map((step, index) => <li key={index}><span>0{index + 1}</span>{step}</li>)}</ol><a href={feedbackUrl} target="_blank" rel="noopener noreferrer" className="button-primary">{copy.contact.openIssue} <span aria-hidden="true">↗</span></a><small>{copy.contact.requirement}</small></article><div className="explore-contact-aside"><article className="explore-contact-note explore-reveal"><span aria-hidden="true">✦</span><h2>{copy.contact.privacyTitle}</h2><p>{copy.contact.privacyBody}</p></article><article className="explore-contact-note explore-reveal"><span aria-hidden="true">?</span><h2>{copy.contact.quickTitle}</h2><p>{copy.contact.quickBody}</p><Link href="/explore/faq">{copy.contact.quickAction} →</Link></article></div></section>
  </ExploreFrame>;
}
