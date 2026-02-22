import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { ExpertListComponent } from './components/expert-list.component';
import { VideoRoomComponent } from './components/video-room.component';
import { PlansComponent } from './components/plans/plans.component';
import { WalletComponent } from './components/wallet.component';
import { CommunityComponent } from './components/community.component';
import { SettingsComponent } from './components/settings.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'plans', component: PlansComponent },
  { path: 'results', component: ExpertListComponent },
  { path: 'room/:id', component: VideoRoomComponent },
  { path: 'wallet', component: WalletComponent },
  { path: 'community', component: CommunityComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'sos', component: HomeComponent },
  { path: '**', redirectTo: '' }
];