import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

/** Error state matcher that matches when a control is invalid and dirty. */
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

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  //required components
  //removed strict typing in tsconfig
  
  loginForm: FormGroup;
  nickname = '';
  ref = firebase.database().ref('users/');
  matcher = new MyErrorStateMatcher();

  // injecting form builder and angular router
  constructor(private router: Router, private formBuilder: FormBuilder) {}

  //Conditions to check if the components do exist

  ngOnInit(): void {
    if (localStorage.getItem('nickname')) {
      this.router.navigate(['/roomlist']);
    }
    this.loginForm = this.formBuilder.group({
      nickname: [null, Validators.required],
    });
  }
  onFormSubmit(form: any) {
    const login = form;
    this.ref
      .orderByChild('nickname')
      .equalTo(login.nickname)
      .once('value', (snapshot) => {
        if (snapshot.exists()) {
          localStorage.setItem('nickname', login.nickname);
          this.router.navigate(['/roomlist']);
        } else {
          const newUser = firebase.database().ref('users/').push();
          newUser.set(login);
          localStorage.setItem('nickname', login.nickname);
          this.router.navigate(['/roomlist']);
        }
      });
  }
}
