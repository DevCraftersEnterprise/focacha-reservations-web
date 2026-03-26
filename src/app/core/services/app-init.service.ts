import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {

  private readonly authService = inject(AuthService);

  async init(): Promise<void> {
    await firstValueFrom(this.authService.bootstrapSession());
  }
}
