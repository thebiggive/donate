/**
 * @link https://app.swaggerhub.com/apis/Noel/TBG-Campaigns/#/Campaign
 */
export interface Campaign {
    id: string;
    aims: string[];
    amountRaised: number;
    additionalImageUris: Array<{uri: string, order: number}>;
    bannerUri: string;
    beneficiaries: string[];
    budgetDetails: Array<{amount: number, description: string}>;
    categories: string[];
    championName: string;
    isRegularGiving: boolean | undefined;
    charity: {
      id: string;
      name: string;
      optInStatement: string;
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      logoUri?: string;
      regulatorNumber: string;
      regulatorRegion: string;
      stripeAccountId?: string;
      twitter?: string;
      website: string;
    };
    countries: string[];
    currencyCode: 'GBP' | 'USD';
    donationCount: number;
    /**
     * Note type declared is wrong in some or all cases - may be a string e.g. `2025-01-29T12:30:00.000Z` not date Object.
     **/
    endDate: Date;
    impactReporting: string;
    impactSummary: string;
    isMatched: boolean;
    matchFundsRemaining: number;
    matchFundsTotal: number;
    parentUsesSharedFunds: boolean;
    problem: string;
    quotes: Array<{person: string, quote: string}>;
    ready: boolean;
    solution: string;

    /**
     * Note type declared is wrong in some or all cases - may be a string e.g. `2025-01-29T12:30:00.000Z` not date Object.
     **/
    startDate: Date;
    // More on Campaign status semantics defined in Salesforce `docs/campaign-status-definitions`.
    status: 'Active' | 'Expired' | 'Preview';
    summary: string;
    title: string;
    updates: Array<{content: string, modifiedDate: Date}>;
    usesSharedFunds: boolean;
    alternativeFundUse?: string;
    campaignCount?: number;
    championOptInStatement?: string;
    championRef?: string;
    hidden: boolean;
    logoUri?: string;
    parentAmountRaised?: number;
    parentDonationCount?: number;
    parentRef?: string;
    parentTarget?: number;
    surplusDonationInfo?: string;
    target?: number;
    thankYouMessage?: string
    video?: {provider: string, key: string};
}
