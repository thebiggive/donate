import { Component, Element, getAssetPath, h, Prop } from '@stencil/core';

@Component({
  tag: 'biggive-footer',
  styleUrl: 'biggive-footer.scss',
  shadow: true,
})
export class BiggiveFooter {
  @Element() host: HTMLBiggiveFooterElement;

  @Prop() headingLevel: 1 | 2 | 3 | 4 | 5 | 6 = 5;

  appendMenu(menuName: string) {
    var node = this.host.querySelector(`[slot="${menuName}"]`);
    if (node !== null) {
      this.host!.shadowRoot!.querySelector(`.${menuName}`)!.appendChild(node);
    }
  }

  componentDidRender() {
    this.appendMenu('nav-primary');
    this.appendMenu('nav-secondary');
    this.appendMenu('nav-tertiary');
    this.appendMenu('nav-postscript');
  }

  render() {
    const HeadingTag = `h${this.headingLevel}`;

    return (
      <footer class="footer">
        <div class="row row-top">
          <nav class="nav nav-primary" aria-labelledby="footer-primary-heading">
            <HeadingTag class="heading" id="footer-primary-heading">
              <slot name="nav-primary-title"></slot>
            </HeadingTag>
          </nav>

          <nav class="nav nav-secondary" aria-labelledby="footer-secondary-heading-heading">
            <HeadingTag class="heading" id="footer-secondary-heading">
              <slot name="nav-secondary-title"></slot>
            </HeadingTag>
          </nav>

          <nav class="nav nav-tertiary" aria-labelledby="footer-tertiary-heading">
            <HeadingTag class="heading" id="footer-tertiary-heading">
              <slot name="nav-tertiary-title"></slot>
            </HeadingTag>
          </nav>

          <div class="button-wrap">
            <biggive-button colour-scheme="white" url="https://blog.thebiggive.org.uk/charities" label="For charities"></biggive-button>
            <biggive-button colour-scheme="white" url="https://blog.thebiggive.org.uk/funders" label="For funders"></biggive-button>
          </div>
        </div>

        <div class="row row-bottom">
          <div class="postscript-wrap">
            <img class="fr-logo" src={getAssetPath('../assets/images/fundraising-regulator.png')} alt="Fundraising Regulator" />

            <nav class="nav nav-postscript" aria-label="Postscript"></nav>
          </div>

          <div class="social-icon-wrap">
            <slot name="social-icons"></slot>
          </div>
          <p>&copy; 2007 – 2022 The Big Give Trust (1136547) | Company number 07273065 | Dragon Court, 27-29 Macklin Street, London WC2B 5LX, United Kingdom</p>
        </div>
      </footer>
    );
  }
}
