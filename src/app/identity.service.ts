import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Inject, Injectable, InjectionToken} from '@angular/core';
import jwtDecode from 'jwt-decode';
import {CookieService} from 'ngx-cookie-service';
import {MatomoTracker} from 'ngx-matomo';
import {StorageService} from 'ngx-webstorage-service';
import {Observable, of} from 'rxjs';
import {delay, retry} from 'rxjs/operators';

import {Credentials} from './credentials.model';
import {environment} from '../environments/environment';
import {IdentityJWT} from './identity-jwt.model';
import {Person} from './person.model';
import {FundingInstruction} from './fundingInstruction.model';

export const TBG_DONATE_ID_STORAGE = new InjectionToken<StorageService>('TBG_DONATE_ID_STORAGE');

@Injectable({
  providedIn: 'root',
})
export class IdentityService {
  private readonly cookieName = 'SESSION';
  private readonly loginPath = '/auth';
  private readonly peoplePath = '/people';
  private readonly resetPasswordTokenPath = '/password-reset-token';
  private readonly resetPasswordPath = '/change-forgotten-password';
  // Key is per-domain/env. For now we simply store a single JWT (or none).
  private readonly storageKey = `${environment.identityApiPrefix}/v1/jwt`;

  private jwtModifiedCallbacks: Array<() => void> = [];

  constructor(
    private http: HttpClient,
    private matomoTracker: MatomoTracker,

    /**
     * @todo remove StorageService once we have been saving JWTs to cookies for one day in prod.
     */
    @Inject(TBG_DONATE_ID_STORAGE) private storage: StorageService,
    private cookieService: CookieService,
  ) {}

  login(credentials: Credentials): Observable<{ jwt: string}> {
    return this.http.post<{ jwt: string}>(
      `${environment.identityApiPrefix}${this.loginPath}`,
      credentials,
    );
  }

  getResetPasswordToken(email: string, captchaCode: string): Observable<[]> {
    return this.http.post<[]>(
      `${environment.identityApiPrefix}${this.resetPasswordTokenPath}`,
      {email_address: email},
      {
        headers: {
          "x-captcha-code": captchaCode
        }
      }
    );
  }

  checkTokenValid(token: string): Observable<object> {
    return this.http.get(
      `${environment.identityApiPrefix}${this.resetPasswordTokenPath}/${token}`,
    );
  }

  resetPassword(password: string, token: string) {
    return this.http.post<{ jwt: string}>(
      `${environment.identityApiPrefix}${this.resetPasswordPath}`,
      {
        new_password: password,
        secret: token
      },
    );
  }

  create(person: Person): Observable<Person> {
    return this.http.post<Person>(
      `${environment.identityApiPrefix}${this.peoplePath}`,
      person);
  }

  get(id: string, jwt: string): Observable<Person> {
    return this.http.get<Person>(
      `${environment.identityApiPrefix}${this.peoplePath}/${id}`,
      {
        headers: new HttpHeaders({ 'X-Tbg-Auth': jwt }),
      },
    );
  }

  /** Returns an observable of a person if logged in, or of null.
   *  Note that the person may not have a password - if not they should
   *  probably not be treated as fully logged-in, although we could offer
   *  them the opportunity to set a password.
   */
  getLoggedInPerson(): Observable<null|Person> {
    const idAndJWT = this.getIdAndJWT();

    if (!idAndJWT || !this.isTokenForFinalisedUser(idAndJWT.jwt)) {
      return of(null);
    }

    return this.get(idAndJWT.id, idAndJWT.jwt);
  }

  update(person: Person): Observable<Person> {
    return this.http.put<Person>(
      `${environment.identityApiPrefix}${this.peoplePath}/${person.id}`,
      person,
      this.getAuthHttpOptions(person),
    ).pipe(retry(2), delay(2000));
  }

  clearJWT() {
    this.cookieService.delete(this.cookieName);
    this.storage.remove(this.storageKey);
    this.executeJwtCallBacks();
  }

  getIdAndJWT(): { id: string, jwt: string } | undefined {
    const cookieValue = this.cookieService.get(this.cookieName);
    var idAndJwt: {jwt: string, id: string};
    if (cookieValue) {
      idAndJwt = JSON.parse(cookieValue);
    } else {
      idAndJwt = this.storage.get(this.storageKey);
    }

    if (idAndJwt === undefined) {
      return undefined;
    }

    if (this.getTokenPayload(idAndJwt.jwt).exp as number < Math.floor(Date.now() / 1000)) {
      // JWT has expired.
      this.clearJWT();
      return undefined;
    }

    return idAndJwt;
  }

  getJWT(): string | undefined {
    return this.getIdAndJWT()?.jwt;
  }

  getPspId(): string {
    const data = this.getTokenPayload(this.getJWT() as string);

    return data.sub.psp_id;
  }

  isTokenForFinalisedUser(jwt: string): boolean {
    return this.getTokenPayload(jwt).sub.complete;
  }

  saveJWT(id: string, jwt: string) {
    const daysTilExpiry = 1;
    this.cookieService.set(this.cookieName, JSON.stringify({id, jwt}), daysTilExpiry, '/');
    this.executeJwtCallBacks();
  }


  private executeJwtCallBacks() {
    this.jwtModifiedCallbacks.forEach(callback => callback());
  }

  /**
   * Runs the given callback any time a JWT is stored, removed or modified.
   *
   * I'm sure this is not idiomatic angular, but it's working.
   */
  onJWTModified(callback: () => void) {
    this.jwtModifiedCallbacks.push(callback);
  }

  getFundingInstructions(id: string, jwt: string): Observable<FundingInstruction> {
    return this.http.get<FundingInstruction>(
      `${environment.identityApiPrefix}${this.peoplePath}/${id}/funding_instructions?currency=gbp`,
      {
        headers: new HttpHeaders({ 'X-Tbg-Auth': jwt }),
      },
    );
  }

  private getTokenPayload(jwt: string): IdentityJWT {
    return jwtDecode<IdentityJWT>(jwt);
  }

  private getAuthHttpOptions(person: Person): { headers: HttpHeaders } {
    const jwt = this.getJWT();

    if (jwt === undefined) {
      this.matomoTracker.trackEvent(
        'identity_error',
        'auth_jwt_error',
        `Not authorised to work with person ${person.id}`,
      );

      return { headers: new HttpHeaders({}) };
    }

    return {
      headers: new HttpHeaders({
        'X-Tbg-Auth': jwt,
      }),
    };
  }
}
