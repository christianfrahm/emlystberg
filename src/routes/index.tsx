import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Sidebar, type NavItem } from "@/components/portfolio/Sidebar";
import { Section } from "@/components/portfolio/Section";

import artwork1 from "@/assets/artwork-1.jpg";
import artwork2 from "@/assets/artwork-2.jpg";
import artwork3 from "@/assets/artwork-3.jpg";
import artwork4 from "@/assets/artwork-4.jpg";
import artwork5 from "@/assets/artwork-5.jpg";
import portrait from "@/assets/portrait.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Ida Holm — Visuel kunstner & poet" },
      {
        name: "description",
        content:
          "Værker, udstillinger og poesi af den danske kunstner Ida Holm. Et levende arkiv af malerier, gavlmalerier og tekster.",
      },
    ],
  }),
});

const NAV: NavItem[] = [
  { id: "gavlmaleri", label: "gavlmaleri", year: "2025" },
  { id: "akryl", label: "akryl på lærred", year: "2025" },
  { id: "solskin", label: "solskin og tvivl", year: "2023" },
  { id: "events", label: "aktuelle events og udstillinger" },
  { id: "om", label: "om mig" },
  { id: "kontakt", label: "kontakt" },
];

const DEFAULT_BG = "var(--butter)";

function Index() {
  const [bg, setBg] = useState(DEFAULT_BG);
  const [activeId, setActiveId] = useState<string>("intro");

  const onEnter = useCallback((id: string, color: string) => {
    setActiveId(id);
    setBg(color);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = bg;
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, [bg]);

  return (
    <div id="top" className="min-h-screen">
      <Sidebar items={NAV} activeId={activeId} />

      <main className="md:ml-72 lg:ml-80">
        {/* Intro */}
        <Section
          id="intro"
          bg={DEFAULT_BG}
          onEnter={onEnter}
          variant="text"
          body={
            <>
              <p className="font-serif italic text-sm uppercase tracking-[0.28em] not-italic text-muted-foreground">
                — et arkiv
              </p>
              <p className="font-serif text-4xl md:text-6xl leading-[1.05] tracking-tight text-foreground">
                Maleri, ord og det stille rum mellem dem.
              </p>
              <p className="text-base font-sans text-foreground/70 max-w-lg leading-[1.8]">
                Ida Holm arbejder med farve som sprog og sprog som flade. Værker
                fra 2018 til i dag, samlet som kapitler i en bog, der aldrig
                helt bliver færdig.
              </p>
            </>
          }
        />

        <Section
          id="gavlmaleri"
          bg="var(--clay)"
          onEnter={onEnter}
          eyebrow="værk · 01"
          title="Gavlmaleri"
          caption="København NV, forår 2025 — akryl og mineralmaling på beton, ca. 14 × 9 m."
          variant="fullscreen"
          images={[
            {
              src: artwork1,
              alt: "Gavlmaleri på betonvæg med blå og orange aftryk",
              caption: "Foto: placeholder · dokumentation",
            },
          ]}
          body={null}
        />

        <Section
          id="gavlmaleri-text"
          bg="var(--clay)"
          onEnter={onEnter}
          variant="split"
          images={[{ src: artwork5, alt: "Detalje af gavlmaleri", aspect: "aspect-[4/5]" }]}
          body={
            <>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground font-sans">
                proces
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Værket
                blev til over fjorten dage i et kvarter, der allerede bar mange
                stemmer. Maleriet lytter mere end det taler.
              </p>
              <p className="italic text-foreground/65">
                “En væg er aldrig tom — den venter bare.”
              </p>
            </>
          }
        />

        <Section
          id="akryl"
          bg="var(--rose)"
          onEnter={onEnter}
          eyebrow="serie · 02"
          title="Akryl på lærred"
          caption="En serie på elleve værker udført i atelieret i Nordvest, vinter 2024 — forår 2025."
          variant="gallery"
          images={[
            { src: artwork2, alt: "Akrylmaleri i koral og dyb grøn" },
            { src: artwork4, alt: "Detalje, ultramarinblå pensselstrøg" },
            { src: artwork3, alt: "Lyst gult værk, gennemsigtige lag" },
          ]}
        />

        <Section
          id="solskin"
          bg="var(--bone)"
          onEnter={onEnter}
          eyebrow="værk · 03"
          title="Solskin og tvivl"
          caption="2023 — akryl på lærred, 120 × 95 cm. Privat samling."
          variant="spread"
          images={[
            {
              src: artwork3,
              alt: "Maleri i bløde gule toner",
              caption: "Solskin og tvivl, 2023",
            },
          ]}
          body={
            <>
              <p>
                Lorem ipsum dolor sit amet. Dette værk handler om de to lys, der
                eksisterer i samme rum: det varme, der tror på dagen, og det
                kølige, der ved bedre.
              </p>
              <p className="italic">
                Et sted mellem at åbne et vindue og at lukke en bog.
              </p>
            </>
          }
        />

        <Section
          id="solskin-poem"
          bg="var(--bone)"
          onEnter={onEnter}
          variant="text"
          body={
            <>
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground font-sans not-italic">
                digt · ledsager til værket
              </p>
              <p>
                jeg lagde gult<br />
                ovenpå mere gult,<br />
                indtil rummet glemte sit navn —
              </p>
              <p>
                så satte jeg en grå linje<br />
                for at huske det.
              </p>
            </>
          }
        />

        <Section
          id="events"
          bg="var(--sage)"
          onEnter={onEnter}
          eyebrow="kalender"
          title="Aktuelle events og udstillinger"
          caption="Et udvalg af kommende og igangværende arbejder. Kontakt for fuld liste."
          variant="spread"
          images={[
            {
              src: artwork5,
              alt: "Udstillingsrum med stort sort-hvidt værk",
              caption: "Galleri Ø, installationsfoto",
            },
          ]}
          body={
            <ul className="space-y-6 font-sans text-base">
              <li>
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  maj — juni 2026
                </p>
                <p className="font-serif text-xl mt-1">
                  Stille farver — Galleri Ø, København
                </p>
                <p className="text-foreground/65 text-sm mt-1">Soloudstilling</p>
              </li>
              <li>
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  august 2026
                </p>
                <p className="font-serif text-xl mt-1">
                  Nordlys — gruppeudstilling, Aarhus Kunsthal
                </p>
              </li>
              <li>
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  efterår 2026
                </p>
                <p className="font-serif text-xl mt-1">
                  Bogudgivelse: «mellem ord og flade», Forlaget Placeholder
                </p>
              </li>
            </ul>
          }
        />

        <Section
          id="om"
          bg="var(--sky)"
          onEnter={onEnter}
          eyebrow="biografi"
          title="Om mig"
          variant="split"
          images={[
            {
              src: portrait,
              alt: "Portræt af kunstneren i atelieret",
              caption: "Atelier, Nordvest",
            },
          ]}
          body={
            <>
              <p>
                Ida Holm (f. 1989) er en dansk visuel kunstner og poet, baseret
                i København. Hun arbejder i krydsfeltet mellem maleri,
                gavlkunst og skrevet sprog.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Uddannet fra Det Kongelige Danske Kunstakademi, 2017. Værker i
                offentlige og private samlinger i Danmark, Sverige og Tyskland.
              </p>
              <p className="italic text-foreground/65">
                «Jeg maler for at finde ud af, hvad jeg ikke kan sige.»
              </p>
            </>
          }
        />

        <Section
          id="kontakt"
          bg="var(--butter)"
          onEnter={onEnter}
          eyebrow="kontakt"
          title="Skriv til mig"
          variant="text"
          body={
            <>
              <p className="font-serif text-foreground/85">
                For henvendelser om værker, udstillinger, gavlmalerier eller
                samtaler — gerne en mail.
              </p>
              <div className="space-y-3 text-base font-sans not-italic">
                <p>
                  <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground block mb-1">
                    e-mail
                  </span>
                  <a href="mailto:hej@idaholm.dk" className="font-serif text-2xl underline-offset-4 hover:underline">
                    hej@idaholm.dk
                  </a>
                </p>
                <p>
                  <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground block mb-1">
                    atelier
                  </span>
                  <span className="font-serif text-xl">Frederikssundsvej, 2400 København NV</span>
                </p>
                <p>
                  <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground block mb-1">
                    instagram
                  </span>
                  <span className="font-serif text-xl">@idaholm.atelier</span>
                </p>
              </div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground pt-12">
                tak fordi du kiggede forbi
              </p>
            </>
          }
        />
      </main>
    </div>
  );
}
