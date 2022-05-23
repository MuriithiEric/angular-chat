import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormControl,
  FormGroupDirective,
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import * as firebase from 'firebase';
import { DatePipe } from '@angular/common';

///** Lets us know when a component is invalid and or dirty. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

//extracts the firebase response to an array of objects
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
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.css'],
})
export class ChatroomComponent implements OnInit {
  //auto scroll to the top of the main class body

  @ViewChild('chatcontent') chatcontent: ElementRef;
  scrolltop: number = null;

  //required variables

  chatForm: FormGroup;
  nickname = '';
  roomname = '';
  message = '';
  users = [];
  chats = [];
  matcher = new MyErrorStateMatcher();

  //injecting required modules

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    public datepipe: DatePipe
  ) {
    this.nickname = localStorage.getItem('nickname');
    this.roomname = this.route.snapshot.params['roomname'];
    firebase
      .database()
      .ref('chats/')
      .on('value', (resp) => {
        this.chats = [];
        this.chats = snapshotToArray(resp);
        setTimeout(
          () => (this.scrolltop = this.chatcontent.nativeElement.scrollHeight),
          500
        );
      });
    firebase
      .database()
      .ref('roomusers/')
      .orderByChild('roomname')
      .equalTo(this.roomname)
      .on('value', (resp2: any) => {
        const roomusers = snapshotToArray(resp2);
        this.users = roomusers.filter((x) => x.status === 'online');
      });
  }

  //initialize formgroup for the message form
  ngOnInit(): void {
    this.chatForm = this.formBuilder.group({
      message: [null, Validators.required],
    });
  }

  //submits message and sends it to the firebase realtime database
  onFormSubmit(form: any) {
    const chat = form;
    chat.roomname = this.roomname;
    chat.nickname = this.nickname;
    chat.date = this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');
    chat.type = 'message';
    const newMessage = firebase.database().ref('chats/').push();
    newMessage.set(chat);
    this.chatForm = this.formBuilder.group({
      message: [null, Validators.required],
    });
  }

  //function to exit chatroom which sends an exit message to the firebase realtime databas, sets status, and goes back to the room
  exitChat() {
    const chat = {
      roomname: '',
      nickname: '',
      message: '',
      date: '',
      type: '',
    };
    chat.roomname = this.roomname;
    chat.nickname = this.nickname;
    chat.date = this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');
    chat.message = `${this.nickname} leave the room`;
    chat.type = 'exit';
    const newMessage = firebase.database().ref('chats/').push();
    newMessage.set(chat);

    firebase
      .database()
      .ref('roomusers/')
      .orderByChild('roomname')
      .equalTo(this.roomname)
      .on('value', (resp: any) => {
        let roomuser = [];
        roomuser = snapshotToArray(resp);
        const user = roomuser.find((x) => x.nickname === this.nickname);
        if (user !== undefined) {
          const userRef = firebase.database().ref('roomusers/' + user.key);
          userRef.update({ status: 'offline' });
        }
      });

    this.router.navigate(['/roomlist']);
  }
}
