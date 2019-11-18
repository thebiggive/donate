export class CampaignSummary {
  public percentRaised: number|string;

  constructor(
    public id: string,
    public amountRaised: number,
    public categories: string[],
    public championName: string,
    public charity: {id: string, name: string},
    public endDate: Date,
    public imageUri: string,
    public isMatched: boolean,
    public matchFundsRemaining: number,
    public startDate: Date,
    public target: number,
    public title: string,
  ) {}
}
