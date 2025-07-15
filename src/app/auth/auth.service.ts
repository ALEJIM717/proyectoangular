import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, delay, catchError } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  password: string; // debe existir este campo en la API mock o agregarlo en MockAPI
  // otros campos si los tienes
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://68743fcedd06792b9c937143.mockapi.io/api/users';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      delay(500), // opcional, para simular tiempo de respuesta
      map(users => {
        const user = users.find(u => u.email === email);
        if (!user) {
          throw { error: 'Correo no encontrado' };
        }
        if (user.password !== password) {
          throw { error: 'Contraseña incorrecta' };
        }
        return { success: true, user };
      }),
      catchError(err => throwError(() => err))
    );
  }
}
