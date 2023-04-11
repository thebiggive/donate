import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpdateCardModalComponent } from './update-card-modal.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {MatButtonModule} from "@angular/material/button";
import {MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {InMemoryStorageService} from "ngx-webstorage-service";
import {TBG_DONATE_ID_STORAGE} from "../identity.service";

describe('UpdateCardModalComponent', () => {
  let component: UpdateCardModalComponent;
  let fixture: ComponentFixture<UpdateCardModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
      imports: [
        FormsModule,
        MatButtonModule,
        MatDialogModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
      ],
      providers: [
        InMemoryStorageService,
        // Inject in-memory storage for tests, in place of local storage.
        { provide: TBG_DONATE_ID_STORAGE, useExisting: InMemoryStorageService },
        { provide: MatDialogRef, useValue: {} },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateCardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
