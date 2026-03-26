import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { BranchesService } from '../../../../core/services/branches.service';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { ReservationCalendarItem, ReservationDayDetailResponse } from '../../../../core/models/dashboard.models';
import { BranchItem } from '../../../../core/models/branch.models';

interface CalendarDayCell {
  date: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  reservationCount: number;
}
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly authService = inject(AuthService);
  private readonly branchesService = inject(BranchesService);
  private readonly dashboardService = inject(DashboardService);

  readonly branches = signal<BranchItem[]>([]);
  readonly selectedBranchId = signal<string | null>(null);

  readonly currentDate = signal(new Date());
  readonly selectedDate = signal(this.formatDate(new Date()));

  readonly calendarSummary = signal<ReservationCalendarItem[]>([]);
  readonly dayDetail = signal<ReservationDayDetailResponse | null>(null);

  readonly loadingBranches = signal(false);
  readonly loadingCalendar = signal(false);
  readonly loadingDayDetail = signal(false);
  readonly pageError = signal('');

  readonly monthLabel = computed(() => {
    const formatter = new Intl.DateTimeFormat('es-MX', {
      month: 'long',
      year: 'numeric',
    });

    const label = formatter.format(this.currentDate());
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  readonly weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  readonly calendarDays = computed<CalendarDayCell[]>(() => {
    const current = this.currentDate();
    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);

    const mondayBasedOffset = (firstDayOfMonth.getDay() + 6) % 7;
    const gridStart = new Date(year, month, 1 - mondayBasedOffset);

    const cells: CalendarDayCell[] = [];
    const summaryMap = new Map(
      this.calendarSummary().map((item) => [item.date, item.count]),
    );

    const todayStr = this.formatDate(new Date());
    const selected = this.selectedDate();

    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(gridStart);
      cellDate.setDate(gridStart.getDate() + i);

      const cellDateStr = this.formatDate(cellDate);
      const inCurrentMonth = cellDate.getMonth() === month;

      cells.push({
        date: cellDateStr,
        dayNumber: cellDate.getDate(),
        inCurrentMonth,
        isToday: cellDateStr === todayStr,
        isSelected: cellDateStr === selected,
        reservationCount: summaryMap.get(cellDateStr) ?? 0,
      });
    }

    return cells;
  });

  constructor() {
    effect(() => {
      const user = this.authService.user();

      if (!user) return;

      if (user.role === 'CASHIER') {
        this.selectedBranchId.set(user.branchId ?? null);
        if (user.branchId) {
          this.loadCalendar();
          this.loadDayDetail();
        }
      }
    });

    this.loadInitialData();
  }

  loadInitialData(): void {
    const user = this.authService.user();

    if (!user) return;

    if (user.role === 'ADMIN') {
      this.loadBranches();
      return;
    }

    if (user.role === 'CASHIER' && user.branchId) {
      this.selectedBranchId.set(user.branchId);
      this.loadCalendar();
      this.loadDayDetail();
    }
  }

  loadBranches(): void {
    this.loadingBranches.set(true);
    this.pageError.set('');

    this.branchesService.findAll().subscribe({
      next: (branches) => {
        this.branches.set(branches);
        this.loadingBranches.set(false);

        if (branches.length > 0 && !this.selectedBranchId()) {
          this.selectedBranchId.set(branches[0].id);
          this.loadCalendar();
          this.loadDayDetail();
        }
      },
      error: (error) => {
        this.loadingBranches.set(false);
        this.pageError.set(
          error?.error?.message || 'No se pudieron cargar las sucursales.',
        );
      },
    });
  }

  previousMonth(): void {
    const next = new Date(this.currentDate());
    next.setMonth(next.getMonth() - 1);
    this.currentDate.set(next);
    this.loadCalendar();
  }

  nextMonth(): void {
    const next = new Date(this.currentDate());
    next.setMonth(next.getMonth() + 1);
    this.currentDate.set(next);
    this.loadCalendar();
  }

  onBranchChange(value: string): void {
    this.selectedBranchId.set(value);

    const current = this.currentDate();

    const selected = new Date(
      current.getFullYear(),
      current.getMonth(),
      current.getDate(),
    );
    this.selectedDate.set(this.formatDate(selected));

    this.loadCalendar();
    this.loadDayDetail();
  }

  selectDay(date: string, inCurrentMonth: boolean): void {
    this.selectedDate.set(date);

    if (!inCurrentMonth) {
      const target = new Date(`${date}T00:00:00`);
      this.currentDate.set(
        new Date(target.getFullYear(), target.getMonth(), 1),
      );
      this.loadCalendar(() => this.loadDayDetail());
      return;
    }

    this.loadDayDetail();
  }

  loadCalendar(afterLoad?: () => void): void {
    const branchId = this.selectedBranchId();

    if (!branchId) return;

    const current = this.currentDate();
    const month = current.getMonth() + 1;
    const year = current.getFullYear();

    this.loadingCalendar.set(true);
    this.pageError.set('');

    this.dashboardService.getCalendarSummary(branchId, month, year).subscribe({
      next: (data) => {
        this.calendarSummary.set(data);
        this.loadingCalendar.set(false);

        const selected = this.selectedDate();
        const selectedDateObj = new Date(`${selected}T00:00:00`);

        if (
          selectedDateObj.getMonth() !== current.getMonth() ||
          selectedDateObj.getFullYear() !== current.getFullYear()
        ) {
          const firstDay = this.formatDate(new Date(year, current.getMonth(), 1));
          this.selectedDate.set(firstDay);
        }

        afterLoad?.();
      },
      error: (error) => {
        this.loadingCalendar.set(false);
        this.pageError.set(
          error?.error?.message || 'No se pudo cargar el calendario.',
        );
      },
    });
  }

  loadDayDetail(): void {
    const branchId = this.selectedBranchId();
    const date = this.selectedDate();

    if (!branchId || !date) return;

    this.loadingDayDetail.set(true);
    this.pageError.set('');

    this.dashboardService.getDayDetail(branchId, date).subscribe({
      next: (data) => {
        this.dayDetail.set(data);
        this.loadingDayDetail.set(false);
      },
      error: (error) => {
        this.loadingDayDetail.set(false);
        this.pageError.set(
          error?.error?.message || 'No se pudo cargar el detalle del día.',
        );
      },
    });
  }

  formatTime(time: string): string {
    return time?.slice(0, 5) ?? '';
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
