import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
export interface LeadPayload {
  name: string;
  email: string;
  phone?: string;
  website?: string;
  message: string;
  source?: string;
}
@Injectable({ providedIn: 'root' })
export class LeadService {
  private readonly http = inject(HttpClient);
  submit(payload: LeadPayload) {
    return this.http.post<{ reference: string; receivedAtUtc: string }>('/api/leads', payload);
  }
}
