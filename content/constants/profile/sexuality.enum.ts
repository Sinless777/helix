// content/constants/profile/sexuality.enum.ts

// NOTE: These labels reflect a snapshot from the Sexuality Wiki (Fandom).
// The community/terminology evolves; consider keeping `Other` + a free-text
// `sexualityCustom` field in your profile for forward compatibility.

export enum Sexuality {
  // Core & mono-/multi- umbrellas
  Heterosexual = "heterosexual",
  Homosexual = "homosexual",
  Gay = "gay",
  Lesbian = "lesbian",
  Monosexual = "monosexual",

  // Attraction to femininity / womanhood
  Femmesexual = "femmesexual",
  Finsexual = "finsexual",
  Gynesexual = "gynesexual",
  Gynosexual = "gynosexual",

  // Attraction to masculinity / manhood
  Agynosexual = "agynosexual",
  Androsexual = "androsexual",
  Mascusexual = "mascusexual",
  Minsexual = "minsexual",

  // Synonyms/alt labels seen for gay/masc attraction groupings
  Uranian = "uranian",
  Turian = "turian",
  Veldian = "veldian",
  Cinthean = "cinthean",

  // Multisexual (mspec / “bisexual umbrella”)
  Bisexual = "bisexual",
  Androbisexual = "androbisexual",
  Androflexible = "androflexible",
  Androgynosexual = "androgynosexual",
  Anthrosexual = "anthrosexual",
  Omnisexual = "omnisexual",
  Pansexual = "pansexual",
  Polysexual = "polysexual",
  Spectrasexual = "spectrasexual",
  Cupidosexual = "cupidosexual",
  Mutosexual = "mutosexual",

  // Ace-spec & related
  Asexual = "asexual",
  Abrosexual = "abrosexual",
  Sanssexual = "sanssexual",
  Aceflux = "aceflux",
  Aegosexual = "aegosexual",            // a.k.a. autochorissexual
  Limnosexual = "limnosexual",
  Agentosexual = "agentosexual",
  Akoisexual = "akoisexual",
  Lithosexual = "lithosexual",
  Proculsexual = "proculsexual",
  Apothisexual = "apothisexual",
  Burstsexual = "burstsexual",
  Ceasesexual = "ceasesexual",
  Cupiosexual = "cupiosexual",
  Fictosexual = "fictosexual",
  Graysexual = "graysexual",
  Demisexual = "demisexual",
  Fraysexual = "fraysexual",

  // “Other sexualities” bucket from the list
  Autosexual = "autosexual",
  Boreasexual = "boreasexual",
  Casssexual = "casssexual",
  Avansexual = "avansexual",
  Ceterosexual = "ceterosexual",
  Narysexual = "narysexual",
  Neusexual = "neusexual",
  Ninsexual = "ninsexual",
  Coeosexual = "coeosexual",
  Flexisexual = "flexisexual",
  Novisexual = "novisexual",
  Novosexual = "novosexual",
  Onesexual = "onesexual",
  Penultisexual = "penultisexual",
  Pomosexual = "pomosexual",
  Toric = "toric",     // nb person exclusively attracted to men
  Trixic = "trixic",   // nb person exclusively attracted to women
  Wentisexual = "wentisexual",

  // General catch-alls / meta
  Queer = "queer",
  SapioSexual = "sapiosexual",
  Questioning = "questioning",
  Other = "other",
  PreferNotToSay = "prefer_not_to_say",
}

export const SexualityValues = Object.values(Sexuality) as string[];
