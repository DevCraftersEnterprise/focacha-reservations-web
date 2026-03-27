import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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
}
