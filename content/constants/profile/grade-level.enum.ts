// content/constants/profile/grade-level.enum.ts
// K–12 + College tiers. (Fixed typos: "bachelor", "college")
export enum GradeLevel {
  K1 = '1',
  K2 = '2',
  K3 = '3',
  K4 = '4',
  K5 = '5',
  K6 = '6',
  K7 = '7',
  K8 = '8',
  K9 = '9',
  K10 = '10',
  K11 = '11',
  K12 = '12',
  Associate = 'associate',
  Bachelor = 'bachelor',
  Master = 'master',
  PhD = 'phd',
  PreferNotToSay = 'prefer_not_to_say',
}

export const GradeLevelValues = Object.values(GradeLevel);
