import {maximumMatchableDonationGivenCampaign} from './regular-giving.component';

describe('Match funds are only usable in multiples of £3', () => {
  ([
    [{matchFundsRemaining: -50, currencyCode: 'GBP'}, {amountInPence: 0, currency: 'GBP'}],
    [{matchFundsRemaining: -0.01, currencyCode: 'GBP'}, {amountInPence: 0, currency: 'GBP'}],
    [{matchFundsRemaining: 0, currencyCode: 'GBP'}, {amountInPence: 0, currency: 'GBP'}],
    [{matchFundsRemaining: 1, currencyCode: 'GBP'}, {amountInPence: 0, currency: 'GBP'}],
    [{matchFundsRemaining: 2.99, currencyCode: 'GBP'}, {amountInPence: 0, currency: 'GBP'}],
    [{matchFundsRemaining: 3, currencyCode: 'GBP'}, {amountInPence: 100, currency: 'GBP'}],
    [{matchFundsRemaining: 5.99, currencyCode: 'GBP'}, {amountInPence: 100, currency: 'GBP'}],
    [{matchFundsRemaining: 6, currencyCode: 'GBP'}, {amountInPence: 200, currency: 'GBP'}],
  ] as const).forEach(([campaign, maxMatchable]) => {
    it('Calculates maximum matchable given state of a campaign', () => {
      expect(maximumMatchableDonationGivenCampaign(campaign)).toEqual(maxMatchable);
    });
  })
})
