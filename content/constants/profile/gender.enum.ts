// content/constants/profile/gender.enum.ts

export enum Gender {
  Woman = "woman",
  Man = "man",
  TransgenderWoman = "transgender_woman",
  TransgenderMan = "transgender_man",
  CisgenderWoman = "cisgender_woman",
  CisgenderMan = "cisgender_man",
  NonBinary = "non_binary",
  Genderqueer = "genderqueer",
  Genderfluid = "genderfluid",
  Agender = "agender",
  Bigender = "bigender",
  Pangender = "pangender",
  Polygender = "polygender",
  Demigender = "demigender",
  Neutrois = "neutrois",
  TwoSpirit = "two_spirit",
  Transfeminine = "transfeminine",
  Transmasculine = "transmasculine",
  Androgyne = "androgyne",
  Androgynous = "androgynous",
  Intergender = "intergender",
  Xenogender = "xenogender",
  Genderflux = "genderflux",
  Abimegender = "abimegender",
  Autigender = "autigender",
  Other = "other",
  PreferNotToSay = "prefer_not_to_say",
}

// Useful when building validators
export const GenderValues = Object.values(Gender) as string[];
