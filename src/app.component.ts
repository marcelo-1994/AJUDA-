import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="flex min-h-screen">
      <app-sidebar></app-sidebar>
      <main class="flex-1 ml-20 md:ml-64 p-4 md:p-8 animate-fade">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent { }