import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly authService = inject(AuthService);

  readonly menuItems = computed(() => {
    const isAdmin = this.authService.isAdmin();

    return [
      { label: 'Dashboard', route: '/dashboard', show: true },
      { label: 'Reservaciones', route: '/reservations', show: true },
      { label: 'Sucursales', route: '/branches', show: isAdmin },
      { label: 'Zonas', route: '/zones', show: isAdmin },
      { label: 'Usuarios', route: '/users', show: isAdmin },
    ].filter(item => item.show);
  });
}
