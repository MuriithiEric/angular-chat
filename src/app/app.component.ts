import { Component } from '@angular/core';
import * as firebase from 'firebase';

const config = {
  apiKey: 'AIzaSyBFhf5CLyYeVsI_m2W1VFSfQa2TiD3_VPw',
  databaseURL: 'https://chat-app-fbd32-default-rtdb.firebaseio.com'
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'one-on-one-chat-app';

  constructor() {
    firebase.initializeApp(config);
  }
}

