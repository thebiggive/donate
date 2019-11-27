export class Campaign {
  constructor(
    public id: string,
    public aims: string[],
    public amountRaised: number,
    public additionalImageUris: Array<{uri: string, order: number}>,
    public bannerUri: string,
    public budgetDetails: Array<{amount: number, description: string}>,
    public championName: string,
    public charity: {id: string, name: string},
    public donationCount: number,
    public endDate: Date,
    public giftHandles: Array<{amount: number, description: string}>,
    public impactReporting: string,
    public impactSummary: string,
    public isMatched: boolean,
    public matchFundsRemaining: number,
    public matchFundsTotal: number,
    public problem: string,
    public quotes: Array<{person: string, quote: string}>,
    public solution: string,
    public startDate: Date,
    public status: 'Active' | 'Expired' | 'Preview',
    public summary: string | null,
    public target: number,
    public title: string,
    public updates: Array<{content: string, modifiedDate: Date}>,
    public video?: {provider: string, key: string},
    public alternativeFundUse?: string,
    public campaignCount?: number,
    public championRef?: string,
    public parentRef?: string,
  ) {}
}
