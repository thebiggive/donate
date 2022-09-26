/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface BiggiveBreadcrumbs {
    }
    interface BiggiveCampaignCard {
        /**
          * Full URL of a banner image.
         */
        "banner": string;
        /**
          * Array of full beneficiary labels.
         */
        "beneficiaries": string[];
        /**
          * Text for the link to `callToActionUrl`.
         */
        "callToActionLabel": string;
        /**
          * Full URL of a call to action.
         */
        "callToActionUrl": string;
        /**
          * Display name of the charity's specific time-bound fundraising campaign.
         */
        "campaignTitle": string;
        /**
          * e.g. "Match Funded".
         */
        "campaignType": string;
        /**
          * Array of full category labels.
         */
        "categories": string[];
        /**
          * e.g. 'GBP'.
         */
        "currencyCode": string;
        /**
          * (Ceiling of) whole number of days until campaign end.
         */
        "daysRemaining": number;
        /**
          * Match funds not yet used or reserved, in major unit of currency e.g. pounds GBP.
         */
        "matchFundsRemaining": number;
        /**
          * Display name of the charity or non-profit.
         */
        "organisationName": string;
        /**
          * Target for the campaign including matching but excluding any tax relief, in major unit of currency e.g. pounds GBP.
         */
        "target": number;
        /**
          * Total the campaign has raised so far including matching but excluding any tax relief, in major unit of currency e.g. pounds GBP.
         */
        "totalFundsRaised": number;
    }
    interface BiggiveCard {
    }
    interface BiggiveDropdown {
    }
    interface BiggiveFooter {
    }
    interface BiggiveGrid {
    }
    interface BiggiveHeader {
    }
    interface BiggiveHeroImage {
        /**
          * Full URL of a main hero image.
         */
        "mainImage": string;
        /**
          * Hero image title, typically the page.
         */
        "mainTitle": string;
        /**
          * Header slug
         */
        "slug": string;
        /**
          * Introductory teaser text
         */
        "teaser": string;
    }
    interface BiggiveIcon {
    }
    interface BiggiveQuote {
    }
    interface BiggiveTextInput {
    }
    interface BigiveButton {
    }
    interface DemoCampaignCards {
    }
}
declare global {
    interface HTMLBiggiveBreadcrumbsElement extends Components.BiggiveBreadcrumbs, HTMLStencilElement {
    }
    var HTMLBiggiveBreadcrumbsElement: {
        prototype: HTMLBiggiveBreadcrumbsElement;
        new (): HTMLBiggiveBreadcrumbsElement;
    };
    interface HTMLBiggiveCampaignCardElement extends Components.BiggiveCampaignCard, HTMLStencilElement {
    }
    var HTMLBiggiveCampaignCardElement: {
        prototype: HTMLBiggiveCampaignCardElement;
        new (): HTMLBiggiveCampaignCardElement;
    };
    interface HTMLBiggiveCardElement extends Components.BiggiveCard, HTMLStencilElement {
    }
    var HTMLBiggiveCardElement: {
        prototype: HTMLBiggiveCardElement;
        new (): HTMLBiggiveCardElement;
    };
    interface HTMLBiggiveDropdownElement extends Components.BiggiveDropdown, HTMLStencilElement {
    }
    var HTMLBiggiveDropdownElement: {
        prototype: HTMLBiggiveDropdownElement;
        new (): HTMLBiggiveDropdownElement;
    };
    interface HTMLBiggiveFooterElement extends Components.BiggiveFooter, HTMLStencilElement {
    }
    var HTMLBiggiveFooterElement: {
        prototype: HTMLBiggiveFooterElement;
        new (): HTMLBiggiveFooterElement;
    };
    interface HTMLBiggiveGridElement extends Components.BiggiveGrid, HTMLStencilElement {
    }
    var HTMLBiggiveGridElement: {
        prototype: HTMLBiggiveGridElement;
        new (): HTMLBiggiveGridElement;
    };
    interface HTMLBiggiveHeaderElement extends Components.BiggiveHeader, HTMLStencilElement {
    }
    var HTMLBiggiveHeaderElement: {
        prototype: HTMLBiggiveHeaderElement;
        new (): HTMLBiggiveHeaderElement;
    };
    interface HTMLBiggiveHeroImageElement extends Components.BiggiveHeroImage, HTMLStencilElement {
    }
    var HTMLBiggiveHeroImageElement: {
        prototype: HTMLBiggiveHeroImageElement;
        new (): HTMLBiggiveHeroImageElement;
    };
    interface HTMLBiggiveIconElement extends Components.BiggiveIcon, HTMLStencilElement {
    }
    var HTMLBiggiveIconElement: {
        prototype: HTMLBiggiveIconElement;
        new (): HTMLBiggiveIconElement;
    };
    interface HTMLBiggiveQuoteElement extends Components.BiggiveQuote, HTMLStencilElement {
    }
    var HTMLBiggiveQuoteElement: {
        prototype: HTMLBiggiveQuoteElement;
        new (): HTMLBiggiveQuoteElement;
    };
    interface HTMLBiggiveTextInputElement extends Components.BiggiveTextInput, HTMLStencilElement {
    }
    var HTMLBiggiveTextInputElement: {
        prototype: HTMLBiggiveTextInputElement;
        new (): HTMLBiggiveTextInputElement;
    };
    interface HTMLBigiveButtonElement extends Components.BigiveButton, HTMLStencilElement {
    }
    var HTMLBigiveButtonElement: {
        prototype: HTMLBigiveButtonElement;
        new (): HTMLBigiveButtonElement;
    };
    interface HTMLDemoCampaignCardsElement extends Components.DemoCampaignCards, HTMLStencilElement {
    }
    var HTMLDemoCampaignCardsElement: {
        prototype: HTMLDemoCampaignCardsElement;
        new (): HTMLDemoCampaignCardsElement;
    };
    interface HTMLElementTagNameMap {
        "biggive-breadcrumbs": HTMLBiggiveBreadcrumbsElement;
        "biggive-campaign-card": HTMLBiggiveCampaignCardElement;
        "biggive-card": HTMLBiggiveCardElement;
        "biggive-dropdown": HTMLBiggiveDropdownElement;
        "biggive-footer": HTMLBiggiveFooterElement;
        "biggive-grid": HTMLBiggiveGridElement;
        "biggive-header": HTMLBiggiveHeaderElement;
        "biggive-hero-image": HTMLBiggiveHeroImageElement;
        "biggive-icon": HTMLBiggiveIconElement;
        "biggive-quote": HTMLBiggiveQuoteElement;
        "biggive-text-input": HTMLBiggiveTextInputElement;
        "bigive-button": HTMLBigiveButtonElement;
        "demo-campaign-cards": HTMLDemoCampaignCardsElement;
    }
}
declare namespace LocalJSX {
    interface BiggiveBreadcrumbs {
    }
    interface BiggiveCampaignCard {
        /**
          * Full URL of a banner image.
         */
        "banner"?: string;
        /**
          * Array of full beneficiary labels.
         */
        "beneficiaries"?: string[];
        /**
          * Text for the link to `callToActionUrl`.
         */
        "callToActionLabel"?: string;
        /**
          * Full URL of a call to action.
         */
        "callToActionUrl"?: string;
        /**
          * Display name of the charity's specific time-bound fundraising campaign.
         */
        "campaignTitle"?: string;
        /**
          * e.g. "Match Funded".
         */
        "campaignType"?: string;
        /**
          * Array of full category labels.
         */
        "categories"?: string[];
        /**
          * e.g. 'GBP'.
         */
        "currencyCode"?: string;
        /**
          * (Ceiling of) whole number of days until campaign end.
         */
        "daysRemaining"?: number;
        /**
          * Match funds not yet used or reserved, in major unit of currency e.g. pounds GBP.
         */
        "matchFundsRemaining"?: number;
        /**
          * Display name of the charity or non-profit.
         */
        "organisationName"?: string;
        /**
          * Target for the campaign including matching but excluding any tax relief, in major unit of currency e.g. pounds GBP.
         */
        "target"?: number;
        /**
          * Total the campaign has raised so far including matching but excluding any tax relief, in major unit of currency e.g. pounds GBP.
         */
        "totalFundsRaised"?: number;
    }
    interface BiggiveCard {
    }
    interface BiggiveDropdown {
    }
    interface BiggiveFooter {
    }
    interface BiggiveGrid {
    }
    interface BiggiveHeader {
    }
    interface BiggiveHeroImage {
        /**
          * Full URL of a main hero image.
         */
        "mainImage"?: string;
        /**
          * Hero image title, typically the page.
         */
        "mainTitle"?: string;
        /**
          * Header slug
         */
        "slug"?: string;
        /**
          * Introductory teaser text
         */
        "teaser"?: string;
    }
    interface BiggiveIcon {
    }
    interface BiggiveQuote {
    }
    interface BiggiveTextInput {
    }
    interface BigiveButton {
    }
    interface DemoCampaignCards {
    }
    interface IntrinsicElements {
        "biggive-breadcrumbs": BiggiveBreadcrumbs;
        "biggive-campaign-card": BiggiveCampaignCard;
        "biggive-card": BiggiveCard;
        "biggive-dropdown": BiggiveDropdown;
        "biggive-footer": BiggiveFooter;
        "biggive-grid": BiggiveGrid;
        "biggive-header": BiggiveHeader;
        "biggive-hero-image": BiggiveHeroImage;
        "biggive-icon": BiggiveIcon;
        "biggive-quote": BiggiveQuote;
        "biggive-text-input": BiggiveTextInput;
        "bigive-button": BigiveButton;
        "demo-campaign-cards": DemoCampaignCards;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "biggive-breadcrumbs": LocalJSX.BiggiveBreadcrumbs & JSXBase.HTMLAttributes<HTMLBiggiveBreadcrumbsElement>;
            "biggive-campaign-card": LocalJSX.BiggiveCampaignCard & JSXBase.HTMLAttributes<HTMLBiggiveCampaignCardElement>;
            "biggive-card": LocalJSX.BiggiveCard & JSXBase.HTMLAttributes<HTMLBiggiveCardElement>;
            "biggive-dropdown": LocalJSX.BiggiveDropdown & JSXBase.HTMLAttributes<HTMLBiggiveDropdownElement>;
            "biggive-footer": LocalJSX.BiggiveFooter & JSXBase.HTMLAttributes<HTMLBiggiveFooterElement>;
            "biggive-grid": LocalJSX.BiggiveGrid & JSXBase.HTMLAttributes<HTMLBiggiveGridElement>;
            "biggive-header": LocalJSX.BiggiveHeader & JSXBase.HTMLAttributes<HTMLBiggiveHeaderElement>;
            "biggive-hero-image": LocalJSX.BiggiveHeroImage & JSXBase.HTMLAttributes<HTMLBiggiveHeroImageElement>;
            "biggive-icon": LocalJSX.BiggiveIcon & JSXBase.HTMLAttributes<HTMLBiggiveIconElement>;
            "biggive-quote": LocalJSX.BiggiveQuote & JSXBase.HTMLAttributes<HTMLBiggiveQuoteElement>;
            "biggive-text-input": LocalJSX.BiggiveTextInput & JSXBase.HTMLAttributes<HTMLBiggiveTextInputElement>;
            "bigive-button": LocalJSX.BigiveButton & JSXBase.HTMLAttributes<HTMLBigiveButtonElement>;
            "demo-campaign-cards": LocalJSX.DemoCampaignCards & JSXBase.HTMLAttributes<HTMLDemoCampaignCardsElement>;
        }
    }
}
