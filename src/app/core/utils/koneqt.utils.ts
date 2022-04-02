import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FuseConfirmationDialogComponent } from '@fuse/services/confirmation/dialog/dialog.component';
import * as moment from 'moment';
import { appConfig } from '@core/config/app.config';

@Injectable()
export class KoneQTUtils {
  constructor(
    private _formBuilder: FormBuilder,
    private _fuseConfirmationService: FuseConfirmationService
  ) { }

  /**
   * Convert normal date to koneqt date format
   *
   * @param date Normal date
   * @returns Koneqt date format
   */
  public convertToKoneqtDate(date: string | Date): string {
    return moment(new Date(date)).format(appConfig.timeformat);
  }

  /**
   * Convert koneqt date format to normal
   *
   * @param date Koneqt date
   * @returns Normat date
   */
  public convertToNormalDate(date: string | Date): string {
    return moment(date, appConfig.timeformat).format('M/D/Y');
  }

  /**
   * Generate modal using fuse confirmation component
   *
   * @param modalConfig Fuse modal config
   * @param msg Dialog message
   * @returns MatDialogRef
   */
  public fuseConfirmDialog(modalConfig: any, msg: string = ''): MatDialogRef<FuseConfirmationDialogComponent, any> {

    const modalForm: FormGroup = this._formBuilder.group(modalConfig);
    // Open the dialog and save the reference of it
    modalForm.controls['message'].setValue(msg);
    const dialogRef = this._fuseConfirmationService.open(modalForm.value);

    return dialogRef;
  }

  /**
   * Get the first line of abstract
   *
   * @param abstract Abstract
   * @returns Split by `-` and return first line
   */
  getFirstLine(abstract: string = ''): string {
    const lines = abstract.split(' - ');
    return lines[0];
  }

  /**
   * Get duration time with minutes and format
   *
   * @param minutes Time
   * @param format Display format
   * @returns Duration time with format
   */
  displayDurationTime(minutes: number = 0, format: string = 'H:mm'): string {
    if (minutes === null) {
      return '';
    }
    return moment().startOf('day').minutes(minutes).format(format);
  }

  /**
   * Get Time with date and format
   *
   * @param date Date
   * @param format Date Format
   * @returns Time
   */
  displayTime(date: Date, format: string): string {
    return moment(date).format(format);
  }

  generateTxlOptionByArray(array: any[], labelKey: string, valueKey: string): Record<string, string> {
    const txlOption = {};
    for (const option of array) {
      if(!option[valueKey] || !option[labelKey]) {
        return null;
      }
      txlOption[option[valueKey]] = option[labelKey];
    }
    return txlOption;
  }
}
