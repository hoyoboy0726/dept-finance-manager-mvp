
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DataEntryComponent } from './components/data-entry/data-entry.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DashboardComponent, DataEntryComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  // Simple state for navigation
  view = signal<'dashboard' | 'entry'>('dashboard');
}
