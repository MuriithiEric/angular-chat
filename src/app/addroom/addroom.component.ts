import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as firebase from 'firebase';


/** Lets us know when a component is invalid and dirty. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-addroom',
  templateUrl: './addroom.component.html',
  styleUrls: ['./addroom.component.css']
})
export class AddroomComponent implements OnInit {

  //required components

  roomForm: FormGroup;
  nickname = '';
  roomname = '';
  ref = firebase.database().ref('rooms/');
  matcher = new MyErrorStateMatcher();

  constructor(private router: Router,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private snackBar: MatSnackBar) { }

  //Initiates form builder      

  ngOnInit(): void {
    this.roomForm = this.formBuilder.group({
      'roomname' : [null, Validators.required]
    });
  }

  //function to submit the angular form
  onFormSubmit(form: any) {
    const room = form;
    this.ref.orderByChild('roomname').equalTo(room.roomname).once('value', (snapshot: any) => {
      if (snapshot.exists()) {
        this.snackBar.open('Room name already exist!');
      } else {
        const newRoom = firebase.database().ref('rooms/').push();
        newRoom.set(room);
        this.router.navigate(['/roomlist']);
      }
    });
  }

}
