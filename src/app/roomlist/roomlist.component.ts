import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as firebase from 'firebase';
import { DatePipe } from '@angular/common'; //transforms dates to strings

//Converts firebase results to an array of objects
export const snapshotToArray = (snapshot: any) => {
  const returnArr = [];

  snapshot.forEach((childSnapshot: any) => {
    const item = childSnapshot.val();
    item.key = childSnapshot.key;
    returnArr.push(item);
  });

  return returnArr;
};
@Component({
  selector: 'app-roomlist',
  templateUrl: './roomlist.component.html',
  styleUrls: ['./roomlist.component.css'],
})
export class RoomlistComponent implements OnInit {
  //Required variables for the roomlist

  nickname = '';
  displayedColumns: string[] = ['roomname'];
  rooms = [];
  isLoadingResults = true;

  //Here, we inject the imported modules and initialize them in the constructor

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public datepipe: DatePipe
  ) {
    //implements requests from the firebase realtime database and updates everytime the firebase document is changed
    this.nickname = localStorage.getItem('nickname');
    firebase
      .database()
      .ref('rooms/')
      .on('value', (resp) => {
        this.rooms = [];
        this.rooms = snapshotToArray(resp);
        this.isLoadingResults = false;
      });
  }

  ngOnInit(): void {}

  //functions to enter the chatrrom are triggered when the user chooses a room
  //saves the messages that the user enters
  //adds a new user to the users document as well
  enterChatRoom(roomname: string) {
    const chat = {
      roomname: '',
      nickname: '',
      message: '',
      date: '',
      type: '',
    };
    chat.roomname = roomname;
    chat.nickname = this.nickname;
    chat.date = this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');
    chat.message = `${this.nickname} enter the room`;
    chat.type = 'join';
    const newMessage = firebase.database().ref('chats/').push();
    newMessage.set(chat);

    firebase
      .database()
      .ref('roomusers/')
      .orderByChild('roomname')
      .equalTo(roomname)
      .on('value', (resp: any) => {
        let roomuser = [];
        roomuser = snapshotToArray(resp);
        const user = roomuser.find((x) => x.nickname === this.nickname);
        if (user !== undefined) {
          const userRef = firebase.database().ref('roomusers/' + user.key);
          userRef.update({ status: 'online' });
        } else {
          const newroomuser = { roomname: '', nickname: '', status: '' };
          newroomuser.roomname = roomname;
          newroomuser.nickname = this.nickname;
          newroomuser.status = 'online';
          const newRoomUser = firebase.database().ref('roomusers/').push();
          newRoomUser.set(newroomuser);
        }
      });

    this.router.navigate(['/chatroom', roomname]);
  }

  //function to logout a user with their nickname

  logout(): void {
    localStorage.removeItem('nickname');
    this.router.navigate(['/login']);
  }
}
