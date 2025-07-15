import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface PokemonBasic {
  id: number;
  name: string;
  types: string[];
  weight: number;
  image: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface PokemonFull extends PokemonBasic {
  height: number;
  abilities: string[];
  stats: { name: string; value: number }[];
  moves: string[];
}

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private baseUrl = 'https://pokeapi.co/api/v2/pokemon';

  constructor(private http: HttpClient) {}

  getPokemonsBasic(limit = 30): Observable<PokemonBasic[]> {
    return this.http.get<{ results: { name: string; url: string }[] }>(
      `${this.baseUrl}?limit=${limit}`
    ).pipe(
      switchMap(res => forkJoin(
        res.results.map(p => this.http.get<any>(p.url).pipe(
          map(data => ({
            id: data.id,
            name: data.name,
            image: data.sprites.front_default,
            types: data.types.map((t: any) => t.type.name),
            weight: data.weight / 10 // Convertir a kg
          }))
        ))
      ))
    );
  }

  getPokemonDetails(id: number): Observable<PokemonFull> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map(data => ({
        id: data.id,
        name: data.name,
        types: data.types.map((t: any) => t.type.name),
        weight: data.weight / 10, // Convertir a kg
        height: data.height / 10, // Convertir a metros
        image: data.sprites.front_default,
        abilities: data.abilities.map((a: any) => a.ability.name),
        stats: data.stats.map((s: any) => ({
          name: s.stat.name,
          value: s.base_stat
        })),
        moves: data.moves.map((m: any) => m.move.name).slice(0, 5) // Limitar a 5 movimientos
      }))
    );
  }
  getCurrentUser(): Observable<User> {
    return this.http.get<User>('https://68743fcedd06792b9c937143.mockapi.io/api/users/1');
  }
}