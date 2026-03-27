import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BranchesService } from '../../../../core/services/branches.service';
import { BranchItem } from '../../../../core/models/branch.models';
import { UsersService } from '../../../../core/services/users.service';
import { UserItem } from '../../../../core/models/user.models';

@Component({
  selector: 'app-branches',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './branches.component.html',
})
export class BranchesComponent {
  private readonly fb = inject(FormBuilder);
  private readonly branchesService = inject(BranchesService);
  private readonly usersService = inject(UsersService);

  readonly branches = signal<BranchItem[]>([]);
  readonly users = signal<UserItem[]>([]);

  readonly loading = signal<boolean>(false);
  readonly saving = signal<boolean>(false);
  readonly loadingUsers = signal<boolean>(false);

  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');

  readonly showFormModal = signal<boolean>(false);
  readonly showDeleteModal = signal<boolean>(false);
  readonly showAssignCashiersModal = signal<boolean>(false);

  readonly editingBranch = signal<BranchItem | null>(null);
  readonly deletingBranch = signal<BranchItem | null>(null);
  readonly assigningBranch = signal<BranchItem | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    address: ['', [Validators.required, Validators.maxLength(255)]],
    phone: ['', [Validators.maxLength(20)]],
  });

  readonly assignCashiersForm = this.fb.group({
    cashierIds: this.fb.array<string>([])
  });

  constructor() {
    this.loadBranches();
  }

  get cashierIdsArray(): FormArray {
    return this.assignCashiersForm.get('cashierIds') as FormArray;
  }

  get cashiers(): UserItem[] {
    return this.users().filter(user => user.role === 'CASHIER');
  }

  loadBranches(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.branchesService.findAll().subscribe({
      next: (branches) => {
        this.branches.set(branches);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(
          error?.error?.message || 'No se pudieron cargar las sucursales.',
        );
      },
    });
  }

  loadUsersForAssignment(branch: BranchItem): void {
    this.loadingUsers.set(true);
    this.errorMessage.set('');

    this.usersService.findAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loadingUsers.set(false);
        this.populateAssignedCashiers(branch);
      },
      error: (error) => {
        this.loadingUsers.set(false);
        this.errorMessage.set(
          this.extractErrorMessage(error, 'No se pudieron cargar los usuarios.'),
        );
      },
    });
  }

  openCreateModal(): void {
    this.editingBranch.set(null);
    this.form.reset({
      name: '',
      address: '',
      phone: '',
    });
    this.errorMessage.set('');
    this.successMessage.set('');
    this.showFormModal.set(true);
  }

  openEditModal(branch: BranchItem): void {
    this.editingBranch.set(branch);
    this.form.reset({
      name: branch.name,
      address: branch.address,
      phone: branch.phone ?? '',
    });
    this.errorMessage.set('');
    this.successMessage.set('');
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.editingBranch.set(null);
    this.form.reset({
      name: '',
      address: '',
      phone: '',
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = {
      name: this.form.getRawValue().name.trim(),
      address: this.form.getRawValue().address.trim(),
      phone: this.form.getRawValue().phone?.trim() || undefined,
    };

    const editing = this.editingBranch();

    const request$ = editing
      ? this.branchesService.update(editing.id, payload)
      : this.branchesService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set(`Sucursal ${editing ? 'actualizada' : 'creada'} exitosamente.`);
        this.closeFormModal();
        this.loadBranches();
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(
          error?.error?.message ||
          `No se pudo ${editing ? 'actualizar' : 'crear'} la sucursal.`,
        );
      }
    });
  }

  openDeleteModal(branch: BranchItem): void {
    this.deletingBranch.set(branch);
    this.showDeleteModal.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  closeDeleteModal(): void {
    this.deletingBranch.set(null);
    this.showDeleteModal.set(false);
  }

  confirmDelete(): void {
    const branch = this.deletingBranch();

    if (!branch || this.saving()) return;

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.branchesService.remove(branch.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Sucursal eliminada correctamente.');
        this.closeDeleteModal();
        this.loadBranches();
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(
          this.extractErrorMessage(error, 'No se pudo eliminar la sucursal.'),
        );
      }
    });
  }

  openAssignCashierModal(branch: BranchItem): void {
    this.assigningBranch.set(branch);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.showAssignCashiersModal.set(true);
    this.clearCashierSelections();
    this.loadUsersForAssignment(branch);
  }

  closeAssignCashierModal(): void {
    this.assigningBranch.set(null);
    this.showAssignCashiersModal.set(false);
    this.clearCashierSelections();
  }

  isCashierSelected(cashierId: string): boolean {
    return this.cashierIdsArray.value.includes(cashierId);
  }

  toggleCashier(cashierId: string, checked: boolean): void {
    const currentValues = [...this.cashierIdsArray.value];

    if (checked && !currentValues.includes(cashierId)) {
      this.cashierIdsArray.push(this.fb.control(cashierId));
      return;
    }

    if (!checked) {
      const index = currentValues.findIndex(id => id === cashierId);
      if (index >= 0) {
        this.cashierIdsArray.removeAt(index);
      }
    }
  }

  submitCashierSync(): void {
    const branch = this.assigningBranch();

    if (!branch || this.saving()) return;

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const cashierIds = (this.cashierIdsArray.value as string[]).filter(
      (id): id is string => typeof id === 'string'
    );

    this.branchesService.assignCashiers(branch.id, { cashierIds }).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Cajeros asignados correctamente.');
        this.closeAssignCashierModal();
        this.loadBranches();
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(
          this.extractErrorMessage(error, 'No se pudieron asignar los cajeros.'),
        );
      }
    })
  }

  private populateAssignedCashiers(branch: BranchItem): void {
    this.clearCashierSelections();

    const selectedCashiers = this.cashiers.filter(user => user.branchId === branch.id);

    selectedCashiers.forEach((user) => {
      this.cashierIdsArray.push(this.fb.control(user.id));
    });
  }

  private clearCashierSelections(): void {
    while (this.cashierIdsArray.length > 0) {
      this.cashierIdsArray.removeAt(0);
    }
  }

  private extractErrorMessage(error: any, fallback: string): string {
    const message = error?.error?.message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    return fallback
  }
}
