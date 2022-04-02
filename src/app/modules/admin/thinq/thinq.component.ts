import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThinqRelation, ThinqResponse } from '@core/thinq/thinq.type';
import { Observable, takeUntil, Subject } from 'rxjs';
import { ThinqFormComponent } from './thinq-form/thinq-form.component';
import { ThinqService } from './thinq.service';
import { DELETE_MODAL_CONFIG, VALIDATION_MODAL_CONFIG } from '@core/config/thinq.config';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordComponent } from './dialogs/change-password/change-password.component';
import { KoneQTUtils } from '@core/utils/koneqt.utils';
import { RelateThinqService } from '../relate-thinq/relate-thinq.service';

@Component({
  selector: 'app-thinq',
  templateUrl: './thinq.component.html',
  styleUrls: ['./thinq.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ThinqComponent implements OnInit, OnDestroy {

  @ViewChild('thinqform') _thinqFormView: ThinqFormComponent;

  data: ThinqResponse;
  relationships: ThinqRelation[];
  files: File[] = [];
  title: string;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _thinqService: ThinqService,
    private _relateThinqService: RelateThinqService,
    private _datePipe: DatePipe,
    private _kqUtils: KoneQTUtils,
    private _matDialog: MatDialog,
    private _snackBar: MatSnackBar
  ) { }

  /**
   * On Init
   */
  ngOnInit(): void {
    // Get the data
    this._thinqService.data$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: ThinqResponse) => {
        // Store the data
        this.data = data;
        this.title = this._kqUtils.getFirstLine(this.data.Abstract);
      });
    // Get the relations
    this._relateThinqService.existingRelations$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((relations: ThinqRelation[]) => {
        // Store the data
        this.relationships = relations;
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * Upload file
   *
   * @param event File event
   */
  onSelect(event): void {
    this.files.push(...event.addedFiles);
    // upload file logic
    this._thinqService.uploadFile(event.addedFiles[0]).subscribe(
      (res) => {
        console.log(res);
        this._snackBar.open('File upload complete.', '', {
          duration: 2000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });
      }
    );
  }

  /**
   * Remove file from dropzone
   *
   * @param event File event
   */
  onRemove(event: File): void {
    this.files.splice(this.files.indexOf(event), 1);
  }

  /**
   * Get sub title of thinq
   *
   * @param createdBy Create by
   * @param createdDate Created date
   * @returns Format
   */
  getSubTitle(createdBy: string, createdDate: string): string {
    return 'Created by ' + createdBy + ' at ' + this._datePipe.transform(new Date(createdDate), 'EEEE d\'th\' of MMMM y \'at\' H:M');
  }

  /**
   * Run function footer buttons
   *
   * @param props Button Function
   */
  onClickFooterButton(props: any): void {
    const { clickAction, clickData } = props;
    switch (clickAction) {
      case 'SaveForm':
        this.saveForm();
        break;
      case 'ResetForm':
        this.resetForm();
        break;
      case 'CreateRelatedThinq':
        this.createRelatedThinq();
        break;
      case 'CreateRelationship':
        this.createRelationship();
        break;
      case 'Create':
        this.createThinq(clickData);
        break;
      case 'showChangePasswordDialog':
        this.showChangePasswordDialog();
        break;
      case 'DeleteThinq':
        this.deleteConfirmDialog();
        break;
    }
  }

  /**
   * Save thinq form
   */
  saveForm(): void {
    this._thinqService.saveForm(this._thinqFormView.thinqForm.value).subscribe(
      (res) => {
        if (res['Data'] === 'OK') {
          this._snackBar.open('Saved successfully!', '', {
            duration: 2000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
        } else {
          this.validationDialog(res.Data);
        }
      }
    );
  }

  /**
   * Reset form
   */
  resetForm(): void {
    this._thinqFormView.resetForm();
  }

  /**
   * Create new thinq
   */
  createRelatedThinq(): void {
    this._thinqService.createAppData();
  }

  /**
   * Create new thinq with given data
   *
   * @param data Create thinq data
   */
  createThinq(data: any): void {
    console.log(data);
    this._thinqService.createThinq(data).subscribe();
  }

  /**
   * Create relationship
   */
  createRelationship(): void {
    this._thinqService.createRelationship();
  }

  /**
   * Change password for User cabinet
   */
  showChangePasswordDialog(): void {
    // Open the dialog
    const dialogRef = this._matDialog.open(ChangePasswordComponent);

    dialogRef.afterClosed().subscribe((newPwd) => {
      if (!newPwd) {
        return;
      }
      this._thinqService.changePwd(newPwd).subscribe((res) => {
        if (res === 'OK') {
          this._snackBar.open('Password changed successfully!', '', {
            duration: 2000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
        }
      });
    });
  }

  /**
   * Delete thinq dialog
   */
  deleteConfirmDialog(): void {
    // Open the dialog and save the reference of it
    const dialogRef = this._kqUtils.fuseConfirmDialog(DELETE_MODAL_CONFIG);

    // Subscribe to afterClosed from the dialog reference
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        this._thinqService.deleteThinq().subscribe();
      }
    });
  }

  /**
   * Validation dialog if error occurs when saving thinq
   *
   * @param msg Validation Message
   */
  validationDialog(msg: string): void {
    const dialogRef = this._kqUtils.fuseConfirmDialog(VALIDATION_MODAL_CONFIG, msg);

    // Subscribe to afterClosed from the dialog reference
    dialogRef.afterClosed().subscribe((result) => {
    });
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
