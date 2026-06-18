export const SITE_URL = "https://emilielystberg.dk";

export const SITE_TITLE = "Emilie Lystberg";

export const SITE_DESCRIPTION =
  "Emilie Lystberg – dansk forfatter og kunstner. Portfolio med malerier, gavlmalerier, poesi og udstillinger.";

export const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Emilie Lystberg",
  url: SITE_URL,
  jobTitle: ["Forfatter", "Kunstner"],
  description: SITE_DESCRIPTION,
  email: "emilie@lystberg.dk",
  sameAs: ["https://www.instagram.com/emilielystberg"],
} as const;
