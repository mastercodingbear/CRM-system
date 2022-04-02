/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CabinetClassField } from '@core/admin-view/admin-view.type';
import { RelationshipActionParam } from '@core/thinq/relate-thinq.type';
import { ThinqRelation } from '@core/thinq/thinq.type';
import { KoneQTUtils } from '@core/utils/koneqt.utils';
import { Observable, takeUntil, Subject } from 'rxjs';
import { RelateThinqService } from './relate-thinq.service';


@Component({
  selector: 'app-relate-thinq',
  templateUrl: './relate-thinq.component.html',
  styleUrls: ['./relate-thinq.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RelateThinqComponent implements OnInit {

  existingRelations: ThinqRelation[];
  searchRelations: ThinqRelation[];
  enabledClassName: string[];
  classFields: CabinetClassField[];
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _relateThinqService: RelateThinqService
  ) { }

  ngOnInit(): void {
    this._relateThinqService.existingRelations$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: ThinqRelation[]) => {
        // Get existing relationships
        this.existingRelations = res;
      });
    this._relateThinqService.relationsFirstLevel$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: ThinqRelation[]) => {
        if (res) {
          // Get first level relations
          this.searchRelations = res;
        }
      });
    this._relateThinqService.relatedSearchResult$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any[]) => {
        if (res) {
          // Get search result
          this.searchRelations = res;
        }
      });
    this._relateThinqService.enabledClassName$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: string[]) => {
        // Get enable class names
        this.enabledClassName = res;
      });
    this._relateThinqService.classFields$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: CabinetClassField[]) => {
        // Get class fields
        this.classFields = res;
      });
  }

  /**
   * Get class fields of selected cabinet
   *
   * @param cabinet Cabinet class name
   */
  onSelectCabinet(cabinet: string): void {
    this._relateThinqService.getClassFields(cabinet).subscribe();
  }

  /**
   * Search thinq list that can be related
   *
   * @param searchForm Search form of new relation
   */
  onSearchNewRelation(searchForm: any): void {
    this._relateThinqService.getRelateSearch(
      searchForm.cabinet,
      searchForm.searchField,
      searchForm.searchQuery
    ).subscribe();
  }

  /**
   * Update/Set relationship
   *
   * @param params Relationship option and Target thinq id
   */
  updateRelation(params: RelationshipActionParam): void {
    console.log(params);
    this._relateThinqService.updateRelationship(params).subscribe();
  }

  /**
   * Delete relationship
   *
   * @param params
   */
  deleteRelation(params: RelationshipActionParam): void {
    console.log(params);
    this._relateThinqService.deleteRelationship(params).subscribe();
  }
}
