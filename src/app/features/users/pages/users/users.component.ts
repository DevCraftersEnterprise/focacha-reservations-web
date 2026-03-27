import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../../../core/services/users.service';
import { BranchesService } from '../../../../core/services/branches.service';
import { UserItem, UserRole } from '../../../../core/models/user.models';
import { BranchItem } from '../../../../core/models/branch.models';

@Component({
  selector: 'app-users',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
})
export class UsersComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly branchesService = inject(BranchesService);

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

  openCreateModal(): void { }

  openEditModal(user: UserItem): void { }

  closeFormModal(): void { }

  submit(): void { }

  openDeleteModal(user: UserItem): void { }

  closeDeleteModal(): void { }

  confirmDelete(): void { }

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
