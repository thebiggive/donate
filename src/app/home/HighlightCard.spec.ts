import {campaignFamilyName, SfApiHighlightCard, SFAPIHighlightCardToHighlightCard} from "./HighlightCard";

describe('highlightCard', () => {

  it('should convert a highlight card from the SF API to one we can display', () => {
    const cardFromApi: SfApiHighlightCard = {
      campaignFamily: 'womenGirls',
      appearAt: 'asap',
      disappearAt: 'never',
      headerText: "some header text",
      bodyText: "some body text",
      button: {text: "button text", href:'https://biggive.org/some-path'}
    } as const;

    const donatePrefixForThisEnvironment = 'https://example.com';

    const highlightCardForHomepage = SFAPIHighlightCardToHighlightCard(
      'https://irrelevant.com',
      'https://irrelevant.com',
      donatePrefixForThisEnvironment,
      cardFromApi
    );

    expect(highlightCardForHomepage.backgroundImageUrl.href).toBe('https://example.com/assets/images/turquoise-texture.jpg');
    expect(highlightCardForHomepage.iconColor).toBe('brand-wgmf-purple');
  });

  it('should use blue primary colour by default', () => {
    const cardFromApi: SfApiHighlightCard = {
      campaignFamily: 'some-unknown-campaign-family' as campaignFamilyName,
      appearAt: 'asap',
      disappearAt: 'never',
      headerText: "some header text",
      bodyText: "some body text",
      button: {text: "button text", href: 'https://biggive.org/some-path'}
    } as const;

    const donatePrefixForThisEnvironment = 'https://example.com';

    const highlightCardForHomepage = SFAPIHighlightCardToHighlightCard(
      'https://irrelevant.com',
      'https://irrelevant.com',
      donatePrefixForThisEnvironment,
      cardFromApi
    );

    expect(highlightCardForHomepage.backgroundImageUrl.href).toBe('https://example.com/assets/images/blue-texture.jpg');
    expect(highlightCardForHomepage.iconColor).toBe('primary');
  });

  function cardLinkingTo(href: string): SfApiHighlightCard {
    return {
      button: {
        href: href,
        text: "irrelevant"
      },
      campaignFamily: 'christmasChallenge', // irrelevant
      appearAt: 'asap', // irrelevant
      disappearAt: 'never', // irrelevant
      headerText: "irrelevant",
      bodyText: "irrelevant",
    } as const;
  }

  it('should replace donate origins with origin for relevant environment', () => {
    const cardFromApi = cardLinkingTo("https://donate.biggive.org/some-path");

    const highlightCardForHomepage = SFAPIHighlightCardToHighlightCard(
      'https://example-experience.com',
      'https://example-blog.com',
      'https://example-donate.com',
      cardFromApi
    );

    expect(highlightCardForHomepage.button.href.href).toBe('https://example-donate.com/some-path');
  });

  it('should replace wp origins with origin for relevant environment', () => {
    const cardFromApi = cardLinkingTo("https://biggive.org/some-path");

    const highlightCardForHomepage = SFAPIHighlightCardToHighlightCard(
      'https://example-experience.com',
      'https://example-blog.com',
      'https://example-donate.com',
      cardFromApi
    );

    expect(highlightCardForHomepage.button.href.href).toBe('https://example-blog.com/some-path');
  });


  it('should replace experience origins with origin for relevant environment', () => {
    const cardFromApi = cardLinkingTo("https://community.biggive.org/some-path");

    const highlightCardForHomepage = SFAPIHighlightCardToHighlightCard(
      'https://example-experience.com',
      'https://example-blog.com',
      'https://example-donate.com',
      cardFromApi
    );

    expect(highlightCardForHomepage.button.href.href).toBe('https://example-experience.com/some-path');
  });
});