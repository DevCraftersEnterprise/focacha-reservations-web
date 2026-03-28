import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../../core/services/auth.service';
import { IconsService } from '../../../../core/services/icons.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly authService = inject(AuthService);
  readonly iconsService = inject(IconsService);
  readonly itemClick = output<void>();

  readonly menuItems = computed(() => {
    const isAdmin = this.authService.isAdmin();

    return [
      { label: 'Dashboard', route: '/dashboard', icon: this.iconsService.layoutDashboard, show: true },
      { label: 'Reservaciones', route: '/reservations', icon: this.iconsService.calendar, show: true },
      { label: 'Sucursales', route: '/branches', icon: this.iconsService.building2, show: isAdmin },
      { label: 'Zonas', route: '/zones', icon: this.iconsService.mapPinned, show: isAdmin },
      { label: 'Usuarios', route: '/users', icon: this.iconsService.users, show: isAdmin },
    ].filter(item => item.show);
  });
}
