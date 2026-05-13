import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Sidebar, type NavItem } from "@/components/portfolio/Sidebar";
import { Section } from "@/components/portfolio/Section";

import emiliePortrait from "../../pictures/om mig/AB Emilie Lystberg FORFATTER.jpg";
import yellowTulip from "../../pictures/forside/Yellow_Tulip_PNG_Transparent_Clipart.png";
import solskinOgTvivl from "../../pictures/solskin og tvivl/solskin-og-tvivl_635344_1.jpg";
import tesePoster from "../../pictures/events/tese/SnapInsta.to_670552270_17921748189322817_6741333732493793503_n.jpg";
import bogforum1 from "../../pictures/events/bogforum/SnapInsta.to_655796800_18085849037254740_5006557111501421844_n.jpg";
import gavlmaleri1 from "../../pictures/gavlmaleri/575183774_2910781842451825_8014620892406338350_n.jpg";
import gavlmaleri2 from "../../pictures/gavlmaleri/576400471_2910781879118488_4065438245366497215_n.jpg";
import gavlmaleri3 from "../../pictures/gavlmaleri/576469770_2910781889118487_3309273332169913671_n.jpg";
import gavlmaleri4 from "../../pictures/gavlmaleri/576526841_2910781935785149_2473914557753370951_n.jpg";
import gavlmaleri5 from "../../pictures/gavlmaleri/577018251_2910781915785151_8188054167916885180_n.jpg";
import amalie from "../../pictures/akryl/Amalie.jpg";
import carl from "../../pictures/akryl/Carl.jpg";
import frederik from "../../pictures/akryl/Frederik.jpg";
import kathrine from "../../pictures/akryl/Kathrine.jpg";
import luca from "../../pictures/akryl/Luca.jpg";
import lucas from "../../pictures/akryl/Lucas.jpg";
import marcus from "../../pictures/akryl/Marcus.jpg";
import nicoline from "../../pictures/akryl/Nicoline.jpg";
import sarah from "../../pictures/akryl/Sarah.jpg";
import viktor from "../../pictures/akryl/Viktor.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Emilie Lystberg" },
      {
        name: "description",
        content:
          "Værker, udstillinger og poesi. Et levende arkiv af malerier, gavlmalerier og tekster.",
      },
    ],
  }),
});

const NAV: NavItem[] = [
  { id: "gavlmaleri", label: "gavlmaleri", year: "2025" },
  { id: "akryl", label: "akryl på lærred", year: "2025" },
  { id: "solskin", label: "solskin og tvivl", year: "2023" },
  { id: "events", label: "udstillinger og events" },
  { id: "om", label: "om mig" },
  { id: "kontakt", label: "kontakt" },
];

const DEFAULT_BG = "var(--butter)";
const DEFAULT_THEME_COLOR = "#eadf35";
const MENU_THEME_COLOR = DEFAULT_THEME_COLOR;
const SECTION_BG: Record<string, string> = {
  intro: DEFAULT_BG,
  gavlmaleri: "var(--clay)",
  akryl: "var(--rose)",
  solskin: "var(--bone)",
  events: "var(--sage)",
  om: "var(--sky)",
  kontakt: "var(--butter)",
};
const SECTION_THEME_COLOR: Record<string, string> = {
  intro: DEFAULT_THEME_COLOR,
  gavlmaleri: "#f28b4a",
  akryl: "#f06a5f",
  solskin: "#f0d95a",
  events: "#78d779",
  om: "#58a9f2",
  kontakt: DEFAULT_THEME_COLOR,
};
const SECTION_IDS = ["intro", ...NAV.map((item) => item.id)];
const CURRENT_EVENTS = [
  {
    period: "Maj - Juli 2026",
    title: "Akryl på lærred - Galleri Tese, Aarhus",
    image: tesePoster,
    imageAlt: "Plakat for Akryl på lærred - Galleri Tese, Aarhus",
  },
  {
    period: "November 2024",
    title: "Bogforum, København",
    image: bogforum1,
    imageAlt: "Bogforum, København plakat 1",
  },
];

function Index() {
  const [bg, setBg] = useState(DEFAULT_BG);
  const [activeId, setActiveId] = useState<string>("intro");
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeEvent = CURRENT_EVENTS[activeEventIndex];

  const onEnter = useCallback((id: string, color: string) => {
    setActiveId(id);
    setBg(color);
  }, []);

  const showPreviousEvent = useCallback(() => {
    setActiveEventIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const showNextEvent = useCallback(() => {
    setActiveEventIndex((prev) => Math.min(CURRENT_EVENTS.length - 1, prev + 1));
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = bg;
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, [bg]);

  useEffect(() => {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }

    const themeColor = isMenuOpen
      ? MENU_THEME_COLOR
      : (SECTION_THEME_COLOR[activeId] ?? DEFAULT_THEME_COLOR);
    const applyThemeColor = () => meta.setAttribute("content", themeColor);

    applyThemeColor();
    requestAnimationFrame(applyThemeColor);
    const timeout = window.setTimeout(applyThemeColor, 250);

    return () => window.clearTimeout(timeout);
  }, [activeId, isMenuOpen]);

  const syncSectionFromViewport = useCallback(() => {
    if (typeof window === "undefined") return;

    const viewportCenter = window.innerHeight / 2;
    let bestId = activeId;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const id of SECTION_IDS) {
      const section = document.getElementById(id);
      if (!section) continue;

      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - viewportCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestId = id;
      }
    }

    setActiveId(bestId);
    setBg(SECTION_BG[bestId] ?? DEFAULT_BG);
  }, [activeId]);

  return (
    <div id="top" className="min-h-screen">
      <Sidebar
        items={NAV}
        activeId={activeId}
        backgroundColor={DEFAULT_BG}
        onMenuClose={syncSectionFromViewport}
        onMenuStateChange={setIsMenuOpen}
      />

      <main className="pt-16 md:pt-0 md:ml-72 lg:ml-80">
        {/* Intro */}
        <Section
          id="intro"
          bg={DEFAULT_BG}
          onEnter={onEnter}
          images={[
            {
              src: yellowTulip,
              alt: "Gul tulipan på transparent baggrund",
            },
          ]}
        />

        <Section
          id="gavlmaleri"
          bg="var(--clay)"
          onEnter={onEnter}
          imageOnRight={false}
          title="Gavlmaleri"
          caption="København NV, 39 kvm"
          variant="fullscreen"
          images={[
            {
              src: gavlmaleri1,
              alt: "Gavlmaleri foto 1",
            },
            {
              src: gavlmaleri2,
              alt: "Gavlmaleri foto 2",
            },
            {
              src: gavlmaleri3,
              alt: "Gavlmaleri foto 3",
            },
            {
              src: gavlmaleri4,
              alt: "Gavlmaleri foto 4",
            },
            {
              src: gavlmaleri5,
              alt: "Gavlmaleri foto 5",
            },
          ]}
        />

        <Section
          id="akryl"
          bg="var(--rose)"
          onEnter={onEnter}
          imageOnRight
          title="Akryl på lærred"
          caption="80 X 100 cm. Akryl på lærred."
          variant="gallery"
          images={[
            { src: luca, alt: "Luca", caption: "Luca" },
            { src: amalie, alt: "Amalie", caption: "Amalie" },
            { src: lucas, alt: "Lucas", caption: "Lucas" },
            { src: sarah, alt: "Sarah", caption: "Sarah" },
            { src: marcus, alt: "Marcus", caption: "Marcus" },
            { src: nicoline, alt: "Nicoline", caption: "Nicoline" },
            { src: carl, alt: "Carl", caption: "Carl" },
            { src: frederik, alt: "Frederik", caption: "Frederik" },
            { src: kathrine, alt: "Kathrine", caption: "Kathrine" },
            { src: viktor, alt: "Viktor", caption: "Viktor" },
          ]}
          body={
            <p>
              På nettet sælger vi os selv – frivilligt, på papiret – men praktisk talt er der langt
              fra tale om samtykke. Virksomhederne udnytter vores natur og de lever af vores
              afhængighed. Vi fratages vores ungdom, fortrænger forgængeligheden, fokuserer på det
              forkerte og vi opdager det for sent.
              <br />
              <br />I en verden hvor vi (mere eller mindre) glædeligt sælger os selv, vores drømme,
              ambitioner, og kærlighed til os selv, for bare korte momenter af indbildt glæde –
              spørger jeg: Ville du også sælge dine venner?
            </p>
          }
        />

        <Section
          id="solskin"
          bg="var(--bone)"
          onEnter={onEnter}
          imageOnRight={false}
          title="Solskin og tvivl"
          caption="Amanda Books, 2023"
          variant="spread"
          images={[
            {
              src: solskinOgTvivl,
              alt: "Solskin og tvivl bogforside med citronmotiv",
            },
          ]}
          body={
            <p>
              Kan I huske min gule notesbog fra gymnasietiden? Den bliver nu udgivet som
              digtsamlingen ‘Solskin og Tvivl’.
            </p>
          }
        />

        <Section
          id="events"
          bg="var(--sage)"
          onEnter={onEnter}
          transitionKey={activeEventIndex}
          preloadImageSources={CURRENT_EVENTS.map((event) => event.image)}
          imageOnRight={false}
          title="Udstillinger og events"
          variant="spread"
          showImageNavigation={false}
          images={[
            {
              src: activeEvent.image,
              alt: activeEvent.imageAlt,
            },
          ]}
          body={
            <>
              <div className="h-[3.5rem] overflow-hidden">
                <p className="font-serif text-lg leading-snug">{activeEvent.title}</p>
              </div>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-foreground/70">
                {activeEvent.period}
              </p>
              <div className="mt-5 relative h-14 w-full font-sans">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="translate-y-[5px] text-[11px] uppercase tracking-[0.14em] text-muted-foreground tabular-nums text-center leading-none">
                    {activeEventIndex + 1} / {CURRENT_EVENTS.length}
                  </p>
                </div>

                {activeEventIndex > 0 ? (
                  <button
                    type="button"
                    onClick={showPreviousEvent}
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center text-4xl leading-none font-light text-foreground/40 hover:text-foreground/70 transition-colors cursor-pointer"
                    aria-label="Forrige event"
                  >
                    ‹
                  </button>
                ) : (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-12 w-12" aria-hidden />
                )}
                {activeEventIndex < CURRENT_EVENTS.length - 1 ? (
                  <button
                    type="button"
                    onClick={showNextEvent}
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center text-4xl leading-none font-light text-foreground/40 hover:text-foreground/70 transition-colors cursor-pointer"
                    aria-label="Næste event"
                  >
                    ›
                  </button>
                ) : (
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-12 w-12"
                    aria-hidden
                  />
                )}
              </div>
            </>
          }
        />

        <Section
          id="om"
          bg="var(--sky)"
          onEnter={onEnter}
          imageOnRight
          title="Om mig"
          variant="split"
          images={[
            {
              src: emiliePortrait,
              alt: "Portræt af kunstneren i atelieret",
            },
          ]}
          body={
            <>
              <p>
                Emilie Lystberg (f. 2000) blev som 19-årig student fra Rungsted Gymnasium. Siden da
                har hun været bosat i København og Østrig, hvor hun arbejder som ski-instruktør.
              </p>
              <p>
                Emilie Lystberg har altid været nysgerrig på verden og søger at finde svar på livets
                små og store spørgsmål. Hun har sin lille, solskinsgule notesbog med sig overalt og
                skriver spontane digte, når ordene melder sig.
              </p>
            </>
          }
        />

        <Section
          id="kontakt"
          bg="var(--butter)"
          onEnter={onEnter}
          imageOnRight={false}
          title="Skriv til mig"
          variant="text"
          body={
            <>
              <div className="space-y-3 text-base font-sans not-italic">
                <p>
                  <a
                    href="mailto:emilie@lystberg.dk"
                    className="font-serif text-2xl underline-offset-4 hover:underline"
                  >
                    emilie@lystberg.dk
                  </a>
                </p>
              </div>
            </>
          }
        />
      </main>

      <div
        aria-hidden
        className={[
          "fixed inset-x-0 bottom-0 md:hidden pointer-events-none",
          isMenuOpen ? "z-[60]" : "z-40",
        ].join(" ")}
        style={{
          height: "env(safe-area-inset-bottom)",
          backgroundColor: isMenuOpen ? MENU_THEME_COLOR : bg,
        }}
      />
    </div>
  );
}
