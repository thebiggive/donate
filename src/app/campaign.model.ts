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
     * ISO 8601 formatted datetime
     **/
    endDate: string;
    impactReporting: string | null;
    impactSummary: string | null;
    isMatched: boolean;

    /**
     * Total value of remaining match funds that may be used for this campaign in currency major units.
     * Is reduced when a donation is confirmed or pre-authorised for this campaign or one it shares funds with.
     */
    matchFundsRemaining: number;

    matchFundsTotal: number;
    parentUsesSharedFunds: boolean;
    problem: string | null;
    quotes: Array<{person: string, quote: string}>;
    ready: boolean;
    solution: string | null;

    /**
     * ISO 8601 formatted datetime
     **/
    startDate: string;
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
