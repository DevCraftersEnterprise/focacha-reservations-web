import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../../core/services/auth.service';
import { IconsService } from '../../../../core/services/icons.service';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './topbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  readonly authService = inject(AuthService);
  readonly iconsService = inject(IconsService);

  readonly menuToggle = output<void>();
}
