import { Component } from '@angular/core';
import { faArrowAltCircleRight } from '@fortawesome/free-regular-svg-icons';
import { faPowerOff, faHome, faStore } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  storeIcon = faStore
  homeIcon = faHome
  powerIcon = faPowerOff
  title = 'stock-mngt';
  opened = false;
}
