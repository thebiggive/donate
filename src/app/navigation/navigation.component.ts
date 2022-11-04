import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';

import { allChildComponentImports } from '../../allChildComponentImports';
import { FooterComponent } from '../footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  imports: [
    ...allChildComponentImports,
    FooterComponent,
  ],
})
export class NavigationComponent implements OnInit {
  opened = false;

  constructor(private router: Router) {
  }

  ngOnInit() {
    this.router.events.pipe(
      filter((event: RouterEvent) => event instanceof NavigationStart),
    ).subscribe(() => this.opened = false);
  }
}
