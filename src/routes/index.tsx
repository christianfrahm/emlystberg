import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState, type ReactNode } from "react";
import { OkkergokkerFooter } from "@/components/okkergokker-footer";
import { Sidebar, type NavItem } from "@/components/portfolio/Sidebar";
import { Section } from "@/components/portfolio/Section";
import { SITE_BACKGROUND } from "@/lib/site-colors";

import solskinOgTvivl from "../../pictures/solskin og tvivl/solskin-og-tvivl_635344_1.jpg";
import tesePoster from "../../pictures/events/tese/SnapInsta.to_670552270_17921748189322817_6741333732493793503_n.jpg";
import koi from "../../pictures/koi/koi.jpg";
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

const SECTION_BG = SITE_BACKGROUND;

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Emilie Lystberg" },
      {
        name: "description",
        content:
          "Emilie Lystberg — forfatter og kunstner. Værker, udstillinger og poesi. Et levende arkiv af malerier, gavlmalerier og tekster.",
      },
    ],
  }),
});

const NAV: NavItem[] = [
  { id: "litteratur", label: "litteratur" },
  { id: "kunst", label: "kunst" },
  { id: "aktuelt", label: "aktuelt" },
  { id: "tilgaengelige-vaerker", label: "tilgængelige værker" },
];

const SECTION_IDS = ["intro", ...NAV.map((item) => item.id)];
const CURRENT_EVENT = {
  title: (
    <>
      Duoudstilling,
      <br />
      Galleri Tese
    </>
  ),
  period: "Maj - Juli 2026",
  description:
    'Duoudstilling "Jeg frygter det upersonlige imellem os" hos Galleri TESE, Graven 21 8000 Aarhus C',
  location: "Galleri TESE, Graven 21 8000 Aarhus C",
  image: tesePoster,
  imageAlt: 'Orange eventbillede for "Jeg frygter det upersonlige imellem os" hos Galleri TESE',
};

const formatAvailableWorkCaption = (name: string) =>
  `${name}, en del af værkserien må man sælge sine venner, 2025, 80 X 100, Akryl på lærred.\nTilgængelig hos Galleri TESE, Graven 21 8000 Aarhus C, galleritese@gmail.com`;

function PortfolioCategory({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} data-scroll-align="start" className="relative w-full scroll-mt-0">
      <div className="px-5 sm:px-6 md:px-16 lg:px-24 pt-24 sm:pt-28 md:pt-40">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Index() {
  const [activeId, setActiveId] = useState<string>("intro");

  const onEnter = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const onCategoryEnter = useCallback((categoryId: string) => {
    setActiveId(categoryId);
  }, []);

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
  }, [activeId]);

  return (
    <div id="top" className="min-h-screen bg-background">
      <div className="md:flex md:items-start">
        <Sidebar items={NAV} activeId={activeId} onMenuClose={syncSectionFromViewport} />

        <main className="flex-1 min-w-0">
        {/* Intro */}
        <Section
          id="intro"
          bg={SECTION_BG}
          onEnter={onEnter}
          naturalHeightOnMobile
          sectionClassName="max-md:pt-25 max-md:pb-12 md:py-40"
          variant="text"
          body={
            <>
              <div className="space-y-2 font-sans text-sm leading-relaxed text-foreground/75">
                <p>
                  <a href="https://www.instagram.com/emilielystberg" className="hover:underline">
                    @emilielystberg
                  </a>
                </p>
                <p>
                  <a href="mailto:emilie@lystberg.dk" className="hover:underline">
                    emilie@lystberg.dk
                  </a>
                </p>
              </div>
              <p>
                Emilie Lystberg (2000) Uanset om hun arbejder med ord eller maling, er det
                forgængeligheden der optager hende. Gennem hendes værker minder hun os om tiden der
                går og hun opfordrer os til at leve mere.
              </p>
              <p>
                Emilie Lystbergs værker udfolder sig omkring teknologi og sociale medier og
                kritiserer de virksomheder der bevidst gør os afhængige. Ikke alene lever de af
                vores afhængighed, de overbeviser os om, at det er vores eget valg. Emilie sætter
                spørgsmålstegn ved hvordan vi tager vi kontrollen over vores liv tilbage, i en
                verden hvor vi ikke ved, at vi mistede den, i første omgang?
              </p>
            </>
          }
        />

        <PortfolioCategory id="litteratur" title="Litteratur">
          <Section
            id="solskin"
            bg={SECTION_BG}
            onEnter={() => onCategoryEnter("litteratur")}
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
              <>
                <p>
                  Digtsamlingen SOLSKIN og TVIVL er skrevet af en ung kvinde, som udtrykker sin
                  begejstring for livet og forundring over dets mangfoldighed.
                </p>
                <p>
                  I nogle af digtene rejser Emilie Lystberg tvivl, om alt går den rigtige vej. Hun
                  belyser flere af livets gåder og opfordrer læseren til selv at tage stilling. Der
                  gives ingen svar. Samlingen indbyder til tankefuldhed og undren. Emilie Lystberg
                  udfordrer bevidst sin egen generations – til tider – naive syn på tilværelsen,
                  samtidig med at hun udstiller den verden, som er blevet overleveret til de unge.
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Bogen er illustreret af Floor te Velde.</li>
                  <li>Solskin og Tvivl er Emilie Lystbergs debut som forfatter.</li>
                  <li>Forhandles gennem alle boghandlere.</li>
                </ul>
              </>
            }
          />
        </PortfolioCategory>

        <PortfolioCategory id="kunst" title="Kunst">
          <Section
            id="koi"
            bg={SECTION_BG}
            onEnter={() => onCategoryEnter("kunst")}
            imageOnRight={false}
            title="Koi og Appelsin"
            caption="2025"
            variant="spread"
            images={[
              {
                src: koi,
                alt: "Koi og Appelsin",
              },
            ]}
            body={
              <>
                <p>80 X 100, Akryl på lærred.</p>
                <p>Et værk inspireret af hendes tid i Italien og Japan.</p>
                <p>Et værk om en fisk der svømmer, eller måske flyver.</p>
              </>
            }
          />

          <Section
            id="gavlmaleri"
            bg={SECTION_BG}
            onEnter={() => onCategoryEnter("kunst")}
            imageOnRight={false}
            title="Gavlmaleri"
            caption="2025"
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
            body={<p>København NV, 39 kvm</p>}
          />
        </PortfolioCategory>

        <PortfolioCategory id="aktuelt" title="Aktuelt">
          <Section
            id="events"
            bg={SECTION_BG}
            onEnter={() => onCategoryEnter("aktuelt")}
            imageOnRight={false}
            title={CURRENT_EVENT.title}
            variant="spread"
            showImageNavigation={false}
            images={[
              {
                src: CURRENT_EVENT.image,
                alt: CURRENT_EVENT.imageAlt,
              },
            ]}
            body={
              <>
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-foreground/70">
                  {CURRENT_EVENT.period}
                </p>
                <p>{CURRENT_EVENT.description}</p>
                <p>Emilie er aktuel med værkserien: Må man sælge sine venner</p>
                <p>
                  Kurator Sarah-Kamille Teib, beskriver Emilies værkserie som: "Cute, art-pop,
                  cartoonish og readymade- konceptuel stor værkserie, med mennesketyper vi kender i
                  mange farver."
                </p>
                <p className="italic">
                  Emilie Lystberg retter blikket mod den digitale forbrugerkultur, hvor relationer,
                  opmærksomhed og identitet i stigende grad fungerer som handelsvarer. Hendes værker
                  blotlægger en økonomi, hvor selviscenesættelse fremstilles som frihed, mens
                  afhængighed designes som brugeroplevelse. Spørgsmålet er ikke blot, hvad vi deler,
                  men hvad der udvindes af os, mens vi gør det.
                </p>
              </>
            }
          />
        </PortfolioCategory>

        <PortfolioCategory id="tilgaengelige-vaerker" title="Tilgængelige værker">
          <Section
            id="akryl"
            bg={SECTION_BG}
            onEnter={() => onCategoryEnter("tilgaengelige-vaerker")}
            naturalHeight
            sectionClassName="pt-24 sm:pt-28 md:pt-40 pb-0"
            imageOnRight
            title="Må man sælge sine venner"
            variant="gallery"
            images={[
              { src: luca, alt: "Luca", caption: formatAvailableWorkCaption("Luca") },
              { src: amalie, alt: "Amalie", caption: formatAvailableWorkCaption("Amalie") },
              { src: lucas, alt: "Lucas", caption: formatAvailableWorkCaption("Lucas") },
              { src: sarah, alt: "Sarah", caption: formatAvailableWorkCaption("Sarah") },
              { src: marcus, alt: "Marcus", caption: formatAvailableWorkCaption("Marcus") },
              { src: nicoline, alt: "Nicoline", caption: formatAvailableWorkCaption("Nicoline") },
              { src: carl, alt: "Carl", caption: formatAvailableWorkCaption("Carl") },
              { src: frederik, alt: "Frederik", caption: formatAvailableWorkCaption("Frederik") },
              { src: kathrine, alt: "Kathrine", caption: formatAvailableWorkCaption("Kathrine") },
              { src: viktor, alt: "Viktor", caption: formatAvailableWorkCaption("Viktor") },
            ]}
            body={
              <p>
                På nettet sælger vi os selv – frivilligt, på papiret – men praktisk talt er der
                  langt fra tale om samtykke. Virksomhederne udnytter vores natur og de lever af
                  vores afhængighed. Vi fratages vores ungdom, fortrænger forgængeligheden og vi
                  opdager det for sent.
                <br />
                <br />I en verden hvor vi uden at tøve sælger os selv, spørger Emilie Lystberg, om vi
                også ville sælge vores venner?
              </p>
            }
          />
        </PortfolioCategory>
        </main>
      </div>

      <div className="bg-background pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] sm:pb-6">
        <OkkergokkerFooter footerStyle={{ paddingBottom: 0 }} />
      </div>

      <div
        aria-hidden
        className="fixed inset-x-0 bottom-0 z-40 bg-background md:hidden pointer-events-none"
        style={{ height: "env(safe-area-inset-bottom)" }}
      />
    </div>
  );
}
