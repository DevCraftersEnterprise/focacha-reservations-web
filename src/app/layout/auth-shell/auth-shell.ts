import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-shell',
  imports: [RouterOutlet],
  templateUrl: './auth-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthShell { }
