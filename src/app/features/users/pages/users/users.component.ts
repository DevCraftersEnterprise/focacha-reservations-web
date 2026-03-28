import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { UsersService } from '../../../../core/services/users.service';
import { BranchesService } from '../../../../core/services/branches.service';
import { UserItem, UserRole } from '../../../../core/models/user.models';
import { BranchItem } from '../../../../core/models/branch.models';
import { IconsService } from '../../../../core/services/icons.service';

@Component({
  selector: 'app-users',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './users.component.html',
})
export class UsersComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly branchesService = inject(BranchesService);
  readonly iconsService = inject(IconsService);

  readonly users = signal<UserItem[]>([]);
  readonly branches = signal<BranchItem[]>([]);

  readonly loading = signal<boolean>(false);
  readonly loadingBranches = signal<boolean>(false);
  readonly saving = signal<boolean>(false);

  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');

  readonly showFormModal = signal<boolean>(false);
  readonly showDeleteModal = signal<boolean>(false);

  readonly editingUser = signal<UserItem | null>(null);
  readonly deletingUser = signal<UserItem | null>(null);

  readonly availableRoles: UserRole[] = ['ADMIN', 'CASHIER'];

  readonly form = this.fb.nonNullable.group({
    firstName: ["", [Validators.required, Validators.maxLength(100)]],
    lastName: ["", [Validators.required, Validators.maxLength(100)]],
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.minLength(6)]],
    role: ["CASHIER" as UserRole, [Validators.required]],
    branchId: [null as string | null],
    isActive: [true],
  });

  readonly isEditing = computed(() => !!this.editingUser());
  readonly selectedRole = computed(() => this.form.controls.role.value);
  readonly showBranchField = computed(() => this.selectedRole() === 'CASHIER');

  constructor() {
    this.loadUsers();
    this.loadBranches();

    effect(() => {
      const role = this.form.controls.role.value;

      if (role === 'ADMIN') {
        this.form.controls.branchId.setValue(null, { emitEvent: false });
      }
    });
  }

  loadUsers(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.usersService.findAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(
          this.extractErrorMessage(error, 'No se pudieron cargar los usuarios.'),
        );
      },
    });
  }

  loadBranches(): void {
    this.loadingBranches.set(true);

    this.branchesService.findAll().subscribe({
      next: (branches) => {
        this.branches.set(branches);
        this.loadingBranches.set(false);
      },
      error: (error) => {
        this.loadingBranches.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.editingUser.set(null);
    this.form.reset({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'CASHIER',
      branchId: null,
      isActive: true
    });

    this.form.controls.password.setValidators([
      Validators.required,
      Validators.minLength(6)
    ]);

    this.form.controls.password.updateValueAndValidity();

    this.errorMessage.set('');
    this.successMessage.set('');
    this.showFormModal.set(true);
  }

  openEditModal(user: UserItem): void {
    this.editingUser.set(user);
    this.form.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
      branchId: user.branchId,
      isActive: user.isActive,
    });

    this.form.controls.password.clearValidators
    this.form.controls.password.setValidators([Validators.minLength(6)]);
    this.form.controls.password.updateValueAndValidity();

    this.errorMessage.set('');
    this.successMessage.set('');
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.editingUser.set(null);
    this.form.reset({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'CASHIER',
      branchId: null,
      isActive: true
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const editing = this.editingUser();

    const basePayload = {
      firstName: raw.firstName.trim(),
      lastName: raw.lastName.trim(),
      email: raw.email.trim(),
      role: raw.role,
      isActive: raw.isActive,
    }

    let request$;

    if (editing) {
      const updatePayload = {
        ...basePayload,
        ...(raw.role === 'CASHIER' && raw.branchId ? { branchId: raw.branchId } : {}),
        ...(raw.password.trim() ? { password: raw.password.trim() } : {}),
      };
      request$ = this.usersService.update(editing.id, updatePayload);
    } else {
      const createPayload = {
        ...basePayload,
        password: raw.password.trim(),
        ...(raw.role === 'CASHIER' && raw.branchId ? { branchId: raw.branchId } : {}),
      };
      request$ = this.usersService.create(createPayload);
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set(`Usuario ${editing ? 'actualizado' : 'creado'} exitosamente.`);
        this.closeFormModal();
        this.loadUsers();
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(
          error?.error?.message ||
          `No se pudo ${editing ? 'actualizar' : 'crear'} el usuario.`,
        );
      }
    });
  }

  openDeleteModal(user: UserItem): void {
    this.deletingUser.set(user);
    this.showDeleteModal.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  closeDeleteModal(): void {
    this.deletingUser.set(null);
    this.showDeleteModal.set(false);
  }

  confirmDelete(): void {
    const user = this.deletingUser();

    if (!user || this.saving()) return;

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.usersService.remove(user.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Usuario eliminado correctamente.');
        this.closeDeleteModal();
        this.loadUsers();
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(
          this.extractErrorMessage(error, 'No se pudo eliminar el usuario.'),
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
