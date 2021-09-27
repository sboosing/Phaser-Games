export abstract class Game<Theme = Record<string, never>> {
  sponsor?: string;
  theme?: Theme;

  protected constructor(sponsor?: string, theme?: Theme) {
    this.sponsor = sponsor;
    this.theme = theme;
  }

  setSponsor(sponsorName: string) {
    this.sponsor = sponsorName;
  }

  setTheme(theme: Theme) {
    this.theme = theme;
  }
}
