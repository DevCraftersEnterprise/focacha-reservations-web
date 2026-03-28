import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ZonesService } from '../../../../core/services/zones.service';
import { BranchesService } from '../../../../core/services/branches.service';
import { ZoneItem } from '../../../../core/models/zone.models';
import { BranchItem } from '../../../../core/models/branch.models';
import { IconsService } from '../../../../core/services/icons.service';

@Component({
  selector: 'app-zones',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './zones.component.html',
})
export class ZonesComponent {
  private readonly fb = inject(FormBuilder);
  private readonly zonesService = inject(ZonesService);
  private readonly branchesService = inject(BranchesService);
  readonly iconsService = inject(IconsService);

  readonly zones = signal<ZoneItem[]>([]);
  readonly branches = signal<BranchItem[]>([]);

  readonly loading = signal<boolean>(false);
  readonly loadingBranches = signal<boolean>(false);
  readonly saving = signal<boolean>(false);

  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');

  readonly showFormModal = signal<boolean>(false);
  readonly showDeleteModal = signal<boolean>(false);

  readonly editingZone = signal<ZoneItem | null>(null);
  readonly deletingZone = signal<ZoneItem | null>(null);

  readonly selectedBranchFilter = signal<string | null>(null);


  readonly filteredZones = computed(() => {
    const selectedBranchId = this.selectedBranchFilter();

    if (!this.selectedBranchFilter()) {
      return this.zones();
    }

    return this.zones().filter(zone => zone.branchId === selectedBranchId);
  })

  readonly form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.maxLength(120)]],
    branchId: ["", [Validators.required, Validators.min(1)]],
    capacity: [null as number | null],
    isActive: [true],
  });

  constructor() {
    this.loadBranches();
    this.loadZones();
  }

  loadBranches(): void {
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

  loadZones(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.zonesService.findAll().subscribe({
      next: (zones) => {
        this.zones.set(zones);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(
          this.extractErrorMessage(error, 'No se pudieron cargar las zonas.'),
        );
      },
    });
  }

  onBranchFilterChange(value: string): void {
    this.selectedBranchFilter.set(value || null);
  }

  openCreateModal(): void {
    this.editingZone.set(null);
    this.form.reset({
      name: '',
      branchId: this.branches()[0]?.id ?? '',
      capacity: null,
      isActive: true
    });

    this.errorMessage.set('');
    this.successMessage.set('');
    this.showFormModal.set(true);
  }

  openEditModal(zone: ZoneItem): void {
    this.editingZone.set(zone);
    this.form.reset({
      name: zone.name,
      branchId: zone.branchId,
      capacity: zone.capacity,
      isActive: zone.isActive,
    });


    this.errorMessage.set('');
    this.successMessage.set('');
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.editingZone.set(null);
    this.form.reset({
      name: '',
      branchId: this.branches()[0]?.id ?? '',
      capacity: null,
      isActive: true
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const editing = this.editingZone();

    const basePayload = {
      name: raw.name.trim(),
      branchId: raw.branchId,
      capacity: raw.capacity === null || raw.capacity === undefined || raw.capacity === ('' as any) ? undefined : Number(raw.capacity),
    }

    let request$;

    if (editing) {
      const updatePayload = {
        ...basePayload,
        isActive: raw.isActive,
      };
      request$ = this.zonesService.update(editing.id, updatePayload)
    } else {
      request$ = this.zonesService.create(basePayload);
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set(`Zona ${editing ? 'actualizada' : 'creada'} exitosamente.`);
        this.closeFormModal();
        this.loadZones();
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(
          error?.error?.message ||
          `No se pudo ${editing ? 'actualizar' : 'crear'} la zona.`,
        );
      }
    });
  }

  openDeleteModal(zone: ZoneItem): void {
    this.deletingZone.set(zone);
    this.showDeleteModal.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  closeDeleteModal(): void {
    this.deletingZone.set(null);
    this.showDeleteModal.set(false);
  }

  confirmDelete(): void {
    const zone = this.deletingZone();

    if (!zone || this.saving()) return;

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.zonesService.remove(zone.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Zona eliminada correctamente.');
        this.closeDeleteModal();
        this.loadZones();
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(
          this.extractErrorMessage(error, 'No se pudo eliminar la zona.'),
        );
      }
    });
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