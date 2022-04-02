/* eslint-disable @typescript-eslint/naming-convention */
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
  Output,
  EventEmitter
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map, merge, of, switchMap } from 'rxjs';
import { cloneDeep } from 'lodash-es';
import { RelationshipActionParam } from '@core/thinq/relate-thinq.type';
import { ThinqRelationPagination } from '@core/thinq/thinq.type';


@Component({
  selector: 'thinq-existing-relationships',
  templateUrl: './existing-relationships.component.html',
  styleUrls: ['./existing-relationships.component.scss']
})
export class ExistingRelationshipsComponent implements AfterViewInit, OnChanges {

  @Input() existingRelations: any[];
  @Output() deleteRelationEvent: EventEmitter<RelationshipActionParam> = new EventEmitter<RelationshipActionParam>();

  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;

  relations: any[];
  isLoading: boolean = false;
  pagination: ThinqRelationPagination;
  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    const related = this.getRelation(0, 10, '');
    this.relations = related.relations;
    this.pagination = related.pagination;
  }

  ngAfterViewInit(): void {
    if (this._sort && this._paginator) {
      // Set the initial sort
      this._sort.sort({
        id: '',
        start: 'asc',
        disableClear: true
      });
      // Get products if sort or page changes
      merge(this._sort.sortChange, this._paginator.page).pipe(
        switchMap(() => {
          this.isLoading = true;
          const related = this.getRelation(
            this._paginator.pageIndex,
            this._paginator.pageSize,
            this._sort.active,
            this._sort.direction);
          this.relations = related.relations;
          this.pagination = related.pagination;
          return of(true);
        }),
        map(() => {
          this.isLoading = false;
        })
      ).subscribe();
    }
  }

  /**
   * Init pagination
   */
  initPagination(): void {
    this.pagination.size = 10;
    this.pagination.page = 0;
  }

  /**
   * Get current relationships
   *
   * @param page Page index
   * @param size Page size
   * @param sort Sortby field
   * @param order Sort order
   * @param search Search query
   * @returns Current relationships
   */
  getRelation(
    page: number = 0,
    size: number = 10,
    sort: string,
    order: 'asc' | 'desc' | '' = 'asc',
    search: string = ''
  ): { pagination: ThinqRelationPagination; relations: any[] } {
    let relations: any[] | null = cloneDeep(this.existingRelations);
    if (sort === 'Abstract') {
      relations.sort((a, b) => (a[sort] > b[sort]) ? 1 : ((b[sort] > a[sort]) ? -1 : 0));
      relations = order === 'asc' ? relations : relations.reverse();
    }

    // If search exists...
    if (search) {
      // Filter the products
      relations = relations.filter(relation => relation.Abstract && relation.Abstract.toLowerCase().includes(search.toLowerCase()));
    }

    // Paginate - Start
    const relationsLength = relations.length;

    // Calculate pagination details
    const begin = page * size;
    const end = Math.min((size * (page + 1)), relationsLength);
    const lastPage = Math.max(Math.ceil(relationsLength / size), 1);

    // Prepare the pagination object
    let pagination: ThinqRelationPagination;

    // If the requested page number is bigger than
    // the last possible page number, return null for
    // products but also send the last possible page so
    // the app can navigate to there
    if (page > lastPage) {
      relations = null;
      pagination = {
        length: relationsLength,
        size: size,
        page: page,
        lastPage: lastPage,
        startIndex: begin,
        endIndex: end - 1
      };
    }
    else {
      // Paginate the results by size
      relations = relations.slice(begin, end);

      // Prepare the pagination mock-api
      pagination = {
        length: relationsLength,
        size: size,
        page: page,
        lastPage: lastPage,
        startIndex: begin,
        endIndex: end - 1
      };
    }
    return {
      pagination: pagination,
      relations: relations
    };
  }

  /**
   * Delete relationship
   *
   * @param appDataId Thinq Id
   * @param relationId Relationship Id
   */
  deleteRelation(appDataId: number, relationId: number): void {
    this.deleteRelationEvent.emit({
      TargetId: appDataId,
      RelationshipId: relationId
    });
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.AppDataId || index;
  }
}
