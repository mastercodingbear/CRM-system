import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CabinetClass } from '@core/config/app.config';
import { cloneDeep, groupBy } from 'lodash';
import { debounceTime, map, of, switchMap, Subject, takeUntil } from 'rxjs';
import { CreateThinqService } from './create-thinq.service';

@Component({
  selector: 'app-create-thinq',
  templateUrl: './create-thinq.component.html'
})
export class CreateThinqComponent implements OnInit, OnDestroy {

  cabinets: CabinetClass[];
  cabinetList: Record<string, CabinetClass[]>;
  displayCabinets: Record<string, CabinetClass[]>;
  searchInputControl: FormControl = new FormControl();
  objectKeys = Object.keys;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _createService: CreateThinqService,
    private _router: Router
  ) { }

  /**
   * Setter for bar search input
   *
   * @param value
   */
  @ViewChild('searchInput')
  set searchInput(value: ElementRef) {
    // If the value exists, it means that the search input
    // is now in the DOM and we can focus on the input..
    if (value) {
      // Give Angular time to complete the change detection cycle
      setTimeout(() => {

        // Focus to the input element
        value.nativeElement.focus();
      });
    }
  }

  ngOnInit(): void {
    this._createService.cabinets$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((cabinets: CabinetClass[]) => {
        // Store the data
        this.cabinets = cabinets;
        this.cabinetList = groupBy(this.cabinets, 'ClassGroup');
        this.displayCabinets = cloneDeep(this.cabinetList);
      });
    this.searchInputControl.valueChanges
      .pipe(
        debounceTime(300),
        switchMap((query) => {
          for (const classGroup in this.cabinetList) {
            if (Object.prototype.hasOwnProperty.call(this.cabinetList, classGroup)) {
              let element = this.cabinetList[classGroup];
              element = element.filter((el) => {
                const str = el.ClassDisplayName.toLowerCase();
                return str.includes(query.toLowerCase());
              });
              this.displayCabinets[classGroup] = element;
            }
          }
          return of(true);
        }),
        map(() => {
        })
      ).subscribe();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * Create new Thinq
   *
   * @param classId Cabinet Class Id
   */
  createThinq(classId: number): void {
    this._createService.createThinq(classId).subscribe(
      (res) => {
        const appDataId = Number(res);
        this._router.navigate(['/admin/thinq/' + appDataId]);
      }
    );
  }
}
