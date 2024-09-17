import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { useLaserEyes } from 'lasereyes-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule], // Add CommonModule here
  template: `
    <h1>Welcome to {{ title }}!</h1>
    <h2 *ngIf="laserEyes.connected">Connected</h2>
    <h2 *ngIf="!laserEyes.connected">Not Connected</h2>

    <button *ngIf="!laserEyes.connected" (click)="laserEyes.connect('unisat')">
      Connect
    </button>
    <button *ngIf="laserEyes.connected" (click)="laserEyes.disconnect()">
      Disconnect
    </button>

    <router-outlet />
  `,
  styles: [],
})
export class AppComponent {
  title = 'library-preview';
  laserEyes = useLaserEyes();
}
