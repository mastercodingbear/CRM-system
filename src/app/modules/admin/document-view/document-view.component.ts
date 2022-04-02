import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { environment } from 'environments/environment';
import { ThinqResponse } from '@core/thinq/thinq.type';
import { ThinqService } from '@modules/admin/thinq/thinq.service';

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DocumentViewComponent implements OnInit, OnDestroy {

  data: ThinqResponse;
  fileName: string;
  fileURL: string;
  liveURL = environment.liveURL;
  private _documentURL: string = environment.documentURL;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _thinqService: ThinqService
  ) { }

  ngOnInit(): void {
    // Get the data
    this._thinqService.data$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: ThinqResponse) => {
        // Store the data
        this.data = data;
        this.fileName = data.Fields.DmsFileName?.Value;
        if (this.fileName) {
          this.fileURL = this._documentURL + this.fileName;
        }
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
