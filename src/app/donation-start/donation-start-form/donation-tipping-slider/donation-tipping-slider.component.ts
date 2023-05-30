import {
  AfterContentInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
  SimpleChanges,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-donation-tipping-slider',
  templateUrl: './donation-tipping-slider.component.html',
  styleUrls: ['./donation-tipping-slider.component.scss']
})
export class DonationTippingSliderComponent implements OnInit, AfterContentInit, OnChanges, OnDestroy {

  /**
   * @todo start using this
   */
  @Input() percentageStart: number;
  @Input() percentageEnd: number;
  @Input() donationAmount: number;
  //ISO-4217 currency code (e.g. GBP, USD)
  @Input() donationCurrency!: 'GBP' | 'USD';
  @Input() onHandleMoved: (tipPercentage: number, tipAmount: number) => void;

  /**
   * movable part of the slider
   */
  @ViewChild('handle', {static: true}) handle: ElementRef;
  /**
   * the horizontal slider bar, its width calculated based on device's screen size
   */
  @ViewChild('bar', {static: true}) bar: ElementRef;
  @ViewChild('percentageValue', {static: true}) percentageWrap: ElementRef;
  @ViewChild('donationValue', {static: true}) donationWrap: ElementRef;

  selectedPercentage: number;
  tipAmount: number;
  currencyFormatted: string;

  /*
  * See https://medium.com/claritydesignsystem/four-ways-of-listening-to-dom-events-in-angular-part-3-renderer2-listen-14c6fe052b59
  * re next three properties
  * */
  documentMouseupUnlistener: () => void;
  documentMousemoveUnlistener: () => void;
  documentTouchmoveUnlistener: () => void;

  isMoving = false;
  max: number;
  position: number;
  disableDefaults: boolean = false;

  constructor(
    public renderer: Renderer2
  ) {
    this.documentMouseupUnlistener = renderer.listen('document', 'mouseup', () => {
      this.isMoving = false;
    });

    this.documentMousemoveUnlistener = renderer.listen('document', 'mousemove', (event: MouseEvent | TouchEvent) => {
      this.move(event);
    });

    this.documentTouchmoveUnlistener = renderer.listen('document', 'touchmove', (event: MouseEvent | TouchEvent) => {
      this.move(event);
    });
  };


  ngOnInit() {
    this.setSliderAmounts();
  }

  private setSliderAmounts() {
    this.calcAndSetPercentage();
    this.calcAndSetTipAmount();
    this.adjustDonationPercentageAndValue();
    this.updateHandlePositionFromDonationInput();
  }

  ngAfterContentInit() {
    this.bar.nativeElement.addEventListener('mousedown',  (e: MouseEvent | TouchEvent) => {
      this.isMoving = true;
      this.move(e);
    });

    this.bar.nativeElement.addEventListener('touchstart', (e: MouseEvent | TouchEvent) => {
      this.isMoving = true;
      this.move(e);
    });

    this.bar.nativeElement.addEventListener('touchend', () => {
      this.isMoving = false;
    });
  };

  // detect changes in the donationAmount input
  ngOnChanges(changed: SimpleChanges) {
    this.max = this.bar.nativeElement.offsetWidth - this.handle.nativeElement.offsetWidth;
    if (changed.donationAmount!.currentValue != changed.donationAmount!.previousValue) {
      this.setSliderAmounts();
      this.onHandleMoved(this.selectedPercentage, this.tipAmount);
    }
  }

  ngOnDestroy() {
    this.documentMousemoveUnlistener();
    this.documentMouseupUnlistener();
    this.documentTouchmoveUnlistener();
  }

  // TODO: check if the 15%
  calcAndSetPercentage() {
  // the calculation results from mouse click
   if (this.isMoving) {
     const isAtLeastOne = (this.position / this.max) * this.percentageEnd >= 1;
     this.selectedPercentage = Math.round(isAtLeastOne ? (this.position / this.max) * this.percentageEnd : 1);
   }
  // the calculation results from input changes
   else if (!this.disableDefaults){
      if (!this.donationAmount) {
        this.selectedPercentage = 0;
      }
      if (this.donationAmount >= 1000) {
        this.selectedPercentage = 7.5;
      } else if (this.donationAmount >= 300) {
        this.selectedPercentage = 10;
      } else if (this.donationAmount >= 100) {
        this.selectedPercentage = 12.5;
      } else {
        this.selectedPercentage = 15;
      }
    }
  }

  format(currencyCode: 'GBP' | 'USD', amount: number) {
    return Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  }

  move = (e: MouseEvent | TouchEvent) => {
    if (this.isMoving) {
      this.disableDefaults = true;
      this.max = this.bar.nativeElement.offsetWidth - this.handle.nativeElement.offsetWidth;

      let pageX: number | undefined;
      if (window.TouchEvent && e instanceof TouchEvent) {
        pageX = e.touches[0]?.pageX;
      } else {
        // we Know e is a MouseEvent because all platforms that supports TouchEvent would also have
        // a truthy window.TouchEvent - see https://stackoverflow.com/a/32882849/2803757
        pageX = (e as MouseEvent).pageX;
      }

      if (pageX !== undefined) {
        this.updateSliderAndValues(pageX);
        this.handle.nativeElement.style.marginLeft = this.position + 'px';
      }
    }

  }

  private updateSliderAndValues(pageX: number) {
    if (this.selectedPercentage) {
      this.calcAndSetTipAmount();
      this.updateHandlePositionFromClick(pageX);
      this.adjustDonationPercentageAndValue();
      this.onHandleMoved(this.selectedPercentage, this.tipAmount);
    }
  }

  calcAndSetTipAmount() {
    // todo after adding unit tests - adjust logic to first calculate tipAmount then round iff tipAmount > 1
    if (this.donationAmount < 55) {
      this.tipAmount = this.donationAmount * (this.selectedPercentage / 100);
    } else {
      this.tipAmount = Math.round(this.donationAmount * (this.selectedPercentage / 100));
    }
  }

  updateHandlePositionFromDonationInput() {
    this.position = this.max * this.selectedPercentage / this.percentageEnd;
    this.handle.nativeElement.style.marginLeft = this.position + 'px';
  }

  updateHandlePositionFromClick(pageX: number) {
    const mousePos = pageX - this.bar.nativeElement.offsetLeft - this.handle.nativeElement.offsetWidth / 2;
    this.position = mousePos > this.max ? this.max : mousePos < 0 ? 0 : mousePos;
    this.calcAndSetPercentage();
  }

  adjustDonationPercentageAndValue() {
    this.percentageWrap.nativeElement.innerText = this.selectedPercentage.toString();
    this.currencyFormatted = this.format(this.donationCurrency, this.tipAmount);
    this.donationWrap.nativeElement.innerText = this.currencyFormatted;
  }

  resetSlider = () => {
    this.handle.nativeElement.style.marginLeft = '0px';
    this.percentageWrap.nativeElement.innerText = '1';
    this.donationWrap.nativeElement.innerText = '1';
  };
}




