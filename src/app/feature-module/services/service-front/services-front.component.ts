import { Component, OnInit } from '@angular/core';
import { Candidate } from './candidate.model';
import { CandidateService } from './candidate.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-services-front',
  templateUrl: './services-front.component.html',
  styleUrls: ['./services-front.component.scss']
})
export class ServicesFrontComponent implements OnInit {
  candidates: Candidate[] = [];
  loading = false;
  votedId: string | null = null;
  processingVote = false;
  toastMessage = '';


  constructor(private candidateService: CandidateService) {}

  ngOnInit(): void {
  }


}
