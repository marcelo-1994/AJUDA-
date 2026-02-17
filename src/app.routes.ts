import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { ExpertListComponent } from './components/expert-list.component';
import { VideoRoomComponent } from './components/video-room.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'results', component: ExpertListComponent },
  { path: 'room/:id', component: VideoRoomComponent },
  { path: '**', redirectTo: '' }
];