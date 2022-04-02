
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { FuseValidators } from '@fuse/validators';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;

  /**
   * Constructor
   */
  constructor(
    public matDialogRef: MatDialogRef<ChangePasswordComponent>,
    private _formBuilder: FormBuilder
  ) { }

  /**
   * On init
   */
  ngOnInit(): void {
    // Create the form
    this.passwordForm = this._formBuilder.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordConfirm: ['', [Validators.required]]
      },
      {
        validators: FuseValidators.mustMatch('password', 'passwordConfirm')
      }
    );
  }

  /**
   * Change Password and close modal
   */
  changePassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }
    const newPwd = this.passwordForm.controls['password'].value;
    // Close the dialog
    this.matDialogRef.close(newPwd);
  }

  /**
   * Discard the message
   */
  discard(): void {
    console.log('discard');
    this.passwordForm.reset({ password: '', passwordConfirm: '' });
    // Close the dialog
    this.matDialogRef.close(null);
  }
}
