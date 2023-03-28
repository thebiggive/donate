export type HighlightCard = {
  backgroundImageUrl: URL,
  iconColor: 'primary' | 'brand-4',
  headerText: string,
  bodyText: string,
  button: {
      text: string,
      href: URL,
  },
}
