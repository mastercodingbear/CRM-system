import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { AuthUtils } from '@core/auth/auth.utils';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  /**
   * Constructor
   */
  constructor(private _authService: AuthService) {
  }

  /**
   * Intercept
   *
   * @param req
   * @param next
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the request object

    // let newReq = req.clone();

    // Request
    //
    // If the access token didn't expire, add the Authorization header.
    // We won't add the Authorization header if the access token expired.
    // This will force the server to return a "401 Unauthorized" response
    // for the protected API routes which our response interceptor will
    // catch and delete the access token from the local storage while logging
    // the user out from the app.

    /**
     * Insert new Bearer token for authorization
     */
    // if (this._authService.accessToken && !AuthUtils.isTokenExpired(this._authService.accessToken)) {
    //   newReq = req.clone({
    //     headers: req.headers.set('Authorization', 'Bearer ' + this._authService.accessToken)
    //   });
    // }

    // Response
    return next.handle(req).pipe(
      catchError((err) => {

        console.log(err);
        // Catch "401 Unauthorized" responses
        if (err instanceof HttpErrorResponse && err.status === 401) {
          // TODO: update checking login url.
          const url = req.url.slice(-16);
          if(url === 'doApiV1Login.php') {
            return throwError(() => {
              let error = new Error(err.error);
              error = {
                ...error,
                ...err
              };
              return error;
            });
          }
          this._authService.kqLoginClear();
          location.reload();
        }

        const errorMessage = err.error.message || err.statusText;
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
