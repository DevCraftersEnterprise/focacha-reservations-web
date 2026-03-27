import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ReservationsService } from '../../../../core/services/reservations.service';
import { BranchesService } from '../../../../core/services/branches.service';
import { ZonesService } from '../../../../core/services/zones.service';
import { AuthService } from '../../../../core/services/auth.service';

import { ReservationItem, ReservationStatus } from '../../../../core/models/reservation.models';
import { BranchItem } from '../../../../core/models/branch.models';
import { ZoneItem } from '../../../../core/models/zone.models';

@Component({
  selector: 'app-reservations',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reservations.component.html',
})
export class ReservationsComponent implements OnDestroy {
  private branchIdSub: Subscription;

  private readonly fb = inject(FormBuilder);
  private readonly reservationsService = inject(ReservationsService);
  private readonly branchesService = inject(BranchesService);
  private readonly zonesService = inject(ZonesService);
  readonly authService = inject(AuthService);

  readonly reservations = signal<ReservationItem[]>([]);
  readonly branches = signal<BranchItem[]>([]);
  readonly availableZones = signal<ZoneItem[]>([]);

  readonly loading = signal<boolean>(false);
  readonly saving = signal<boolean>(false);
  readonly loadingBranches = signal<boolean>(false);
  readonly loadingZones = signal<boolean>(false);

  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');

  readonly showFormModal = signal<boolean>(false);
  readonly showCancelModal = signal<boolean>(false);

  readonly editingReservation = signal<ReservationItem | null>(null);
  readonly cancellingReservation = signal<ReservationItem | null>(null);

  readonly selectedBranchFilter = signal<string | null>(null);
  readonly selectedStatusFilter = signal<ReservationStatus | ''>('');
  readonly selectedDateFilter = signal<string>('');

  readonly isAdmin = computed(() => this.authService.isAdmin());
  readonly isCashier = computed(() => this.authService.isCashier());
  readonly currentUser = computed(() => this.authService.user());
  readonly cashierBranchName = computed(
    () => this.currentUser()?.branch?.name || 'Sucursal desconocida',
  );

  readonly form = this.fb.nonNullable.group({
    reservationDate: ['', [Validators.required]],
    reservationTime: ['', [Validators.required]],
    guestCount: [1, [Validators.required, Validators.min(1)]],
    branchId: ['', [Validators.required]],
    zoneId: ['', [Validators.required]],
    eventType: ['', [Validators.required, Validators.maxLength(150)]],
    customerName: ['', [Validators.required, Validators.maxLength(150)]],
    phonePrimary: ['', [Validators.required, Validators.maxLength(20)]],
    phoneSecondary: ['', [Validators.maxLength(20)]],
    notes: ['', [Validators.maxLength(2000)]],
  });

  readonly cancelForm = this.fb.nonNullable.group({
    reason: ['', [Validators.maxLength(250)]],
  });

  constructor() {
    this.loadBranches();
    this.loadReservations();

    this.branchIdSub = this.form.controls.branchId.valueChanges.subscribe((branchId) => {
      if (branchId) {
        this.loadZonesByBranch(branchId);
      } else {
        this.availableZones.set([]);
        this.form.controls.zoneId.setValue('', { emitEvent: false });
      }
    });
  }

  ngOnDestroy(): void {
    this.branchIdSub?.unsubscribe();
  }

  private getEffectiveCashierBranchId(): string {
    return this.currentUser()?.branchId || this.currentUser()?.branch?.id || '';
  }

  loadBranches(): void {
    if (this.isCashier()) {
      const user = this.currentUser();
      const branchId = user?.branchId || user?.branch?.id || '';

      if (branchId) {
        this.selectedBranchFilter.set(branchId);
        this.form.controls.branchId.setValue(branchId, { emitEvent: false });
        this.loadZonesByBranch(branchId); // <- esto faltaba
      } else {
        this.availableZones.set([]);
        this.errorMessage.set('Tu usuario no tiene una sucursal asignada.');
      }

      return;
    }

    this.loadingBranches.set(true);

    this.branchesService.findAll().subscribe({
      next: (branches) => {
        this.branches.set(branches);
        this.loadingBranches.set(false);
      },
      error: () => {
        this.loadingBranches.set(false);
      },
    });
  }

  loadZonesByBranch(branchId: string): void {
    this.loadingZones.set(true);

    this.zonesService.findByBranchId(branchId).subscribe({
      next: (zones) => {
        const activeZones = zones.filter((zone) => zone.isActive);
        this.availableZones.set(activeZones);
        this.loadingZones.set(false);

        const currentZoneId = this.form.controls.zoneId.value;
        const exists = activeZones.some((zone) => zone.id === currentZoneId);

        if (!exists) {
          this.form.controls.zoneId.setValue('', { emitEvent: false });
        }

        if (activeZones.length === 0) {
          this.errorMessage.set('La sucursal no tiene zonas activas disponibles.');
        }
      },
      error: (error) => {
        this.availableZones.set([]);
        this.loadingZones.set(false);
        this.errorMessage.set(
          this.extractErrorMessage(error, 'No se pudieron cargar las zonas.')
        );
      },
    });
  }

  loadReservations(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const filters: {
      branchId?: string;
      reservationDate?: string;
      status?: ReservationStatus;
    } = {};

    const currentUser = this.currentUser();

    if (this.isCashier()) {
      const branchId = currentUser?.branchId || currentUser?.branch?.id;
      if (branchId) {
        filters.branchId = branchId;
      }
    } else if (this.selectedBranchFilter()) {
      filters.branchId = this.selectedBranchFilter()!;
    }

    if (this.selectedDateFilter()) {
      filters.reservationDate = this.selectedDateFilter();
    }

    if (this.selectedStatusFilter()) {
      filters.status = this.selectedStatusFilter() as ReservationStatus;
    }

    this.reservationsService.findAll(filters).subscribe({
      next: (reservations) => {
        this.reservations.set(reservations);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(
          this.extractErrorMessage(error, 'No se pudieron cargar las reservaciones.'),
        );
      },
    });
  }

  onBranchFilterChange(value: string): void {
    this.selectedBranchFilter.set(value || null);
    this.loadReservations();
  }

  onDateFilterChange(value: string): void {
    this.selectedDateFilter.set(value);
    this.loadReservations();
  }

  onStatusFilterChange(value: string): void {
    this.selectedStatusFilter.set((value as ReservationStatus | '') ?? '');
    this.loadReservations();
  }

  clearFilters(): void {
    if (!this.isCashier()) {
      this.selectedBranchFilter.set(null);
    }

    this.selectedDateFilter.set('');
    this.selectedStatusFilter.set('');
    this.loadReservations();
  }

  openCreateModal(): void {
    const cashierBranchId =
      this.currentUser()?.branchId || this.currentUser()?.branch?.id || '';

    const initialBranchId = this.isCashier()
      ? cashierBranchId
      : (this.branches()[0]?.id ?? '');

    this.editingReservation.set(null);
    this.form.reset({
      reservationDate: '',
      reservationTime: '',
      guestCount: 1,
      branchId: initialBranchId,
      zoneId: '',
      eventType: '',
      customerName: '',
      phonePrimary: '',
      phoneSecondary: '',
      notes: '',
    });

    this.availableZones.set([]);

    if (initialBranchId) {
      this.loadZonesByBranch(initialBranchId);
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.showFormModal.set(true);
  }

  openEditModal(reservation: ReservationItem): void {
    this.editingReservation.set(reservation);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.availableZones.set([]);

    this.form.reset({
      reservationDate: reservation.reservationDate,
      reservationTime: this.formatTimeForInput(reservation.reservationTime),
      guestCount: reservation.guestCount,
      branchId: reservation.branchId,
      zoneId: reservation.zoneId,
      eventType: reservation.eventType,
      customerName: reservation.customerName,
      phonePrimary: reservation.phonePrimary,
      phoneSecondary: reservation.phoneSecondary ?? '',
      notes: reservation.notes ?? '',
    });

    this.showFormModal.set(true);
    this.loadZonesByBranch(reservation.branchId);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.editingReservation.set(null);
    this.availableZones.set([]);
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const payload = {
      reservationDate: raw.reservationDate,
      reservationTime: raw.reservationTime,
      guestCount: Number(raw.guestCount),
      branchId: raw.branchId,
      zoneId: raw.zoneId,
      eventType: raw.eventType.trim(),
      customerName: raw.customerName.trim(),
      phonePrimary: raw.phonePrimary.trim(),
      phoneSecondary: raw.phoneSecondary.trim() || undefined,
      notes: raw.notes.trim() || undefined,
    };

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const editing = this.editingReservation();

    const request$ = editing
      ? this.reservationsService.update(editing.id, {
        reservationDate: payload.reservationDate,
        reservationTime: payload.reservationTime,
        guestCount: payload.guestCount,
        branchId: payload.branchId,
        zoneId: payload.zoneId,
        eventType: payload.eventType,
        customerName: payload.customerName,
        phonePrimary: payload.phonePrimary,
        phoneSecondary: payload.phoneSecondary ?? null,
        notes: payload.notes ?? null,
      })
      : this.reservationsService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set(
          editing
            ? 'Reservación actualizada correctamente.'
            : 'Reservación creada correctamente.',
        );
        this.closeFormModal();
        this.loadReservations();
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(
          this.extractErrorMessage(error, 'No se pudo guardar la reservación.'),
        );
      },
    });
  }

  openCancelModal(reservation: ReservationItem): void {
    this.cancellingReservation.set(reservation);
    this.cancelForm.reset({ reason: '' });
    this.errorMessage.set('');
    this.successMessage.set('');
    this.showCancelModal.set(true);
  }

  closeCancelModal(): void {
    this.cancellingReservation.set(null);
    this.showCancelModal.set(false);
    this.cancelForm.reset({ reason: '' });
  }

  confirmCancel(): void {
    const reservation = this.cancellingReservation();

    if (!reservation || this.saving()) return;

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.reservationsService
      .cancel(reservation.id, {
        reason: this.cancelForm.getRawValue().reason.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.successMessage.set('Reservación cancelada correctamente.');
          this.closeCancelModal();
          this.loadReservations();
        },
        error: (error) => {
          this.saving.set(false);
          this.errorMessage.set(
            this.extractErrorMessage(error, 'No se pudo cancelar la reservación.'),
          );
        },
      });
  }

  formatTime(value: string): string {
    return value?.slice(0, 5) ?? '';
  }

  private formatTimeForInput(value: string): string {
    return value?.slice(0, 5) ?? '';
  }

  private extractErrorMessage(error: any, fallback: string): string {
    const message = error?.error?.message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    return fallback;
  }
}