import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Candidate } from './candidate.model';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CandidateService {
  // Mock data
  private candidates: Candidate[] = [
    { id: '1', name: 'Aya N.', number: '001', photoUrl: 'assets/candidates/aya.jpg', votes: 42 },
    { id: '2', name: 'Marco L.', number: '002', photoUrl: 'assets/candidates/marco.jpg', votes: 21 },
    { id: '3', name: 'Sofia R.', number: '003', photoUrl: 'assets/candidates/sofia.jpg', votes: 18 },
    { id: '4', name: 'Daniel K.', number: '004', photoUrl: 'assets/candidates/daniel.jpg', votes: 9 },
  ];

  constructor() {}

  // Simule une requête réseau
  getCandidates(): Observable<Candidate[]> {
    return of(this.candidates).pipe(delay(500));
  }

  // Optionnel: mise à jour côté client pour mock
  incrementVote(id: string): Observable<Candidate | undefined> {
    const c = this.candidates.find(x => x.id === id);
    if (c) {
      c.votes = (c.votes ?? 0) + 1;
    }
    return of(c).pipe(delay(200));
  }
}
