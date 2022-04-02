import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RecentAction, ThinqRelationPagination } from '@core/thinq/thinq.type';
import { FuseLoadingService } from '@fuse/services/loading';
import { cloneDeep } from 'lodash-es';
import { debounceTime, map, merge, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { ThinqService } from '../../thinq/thinq.service';

@Component({
  selector: 'app-recent-action',
  templateUrl: './recent-action.component.html',
  styleUrls: ['./recent-action.component.scss']
})
export class RecentActionComponent implements OnInit, AfterViewInit, OnDestroy {


  @Input() totalActions: RecentAction[];

  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;

  actions: RecentAction[];
  pagination: ThinqRelationPagination;
  searchInputControl: FormControl = new FormControl();
  isLoading: boolean;
  isLoading$: Observable<boolean>;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _loadingService: FuseLoadingService,
    private _thinqService: ThinqService
  ) { }

  ngOnInit(): void {

    const actions = this.getRecentActions(0, 10, '');
    this.actions = actions.actions;
    this.pagination = actions.pagination;
    // Subscribe to search input field value changes
    this.searchInputControl.valueChanges
      .pipe(
        debounceTime(300),
        switchMap((query) => {
          const result = this.getRecentActions(0, this.pagination.size, '', 'asc', query);
          this.pagination = result.pagination;
          this.actions = result.actions;
          return of(true);
        }),
        map(() => {
        })
      ).subscribe();

    this._loadingService.show$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((loading: boolean) => {
        // Store the data
        setTimeout(() => {
          this.isLoading = loading;
        });
      });
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
          const related = this.getRecentActions(
            this._paginator.pageIndex,
            this._paginator.pageSize,
            this._sort.active,
            this._sort.direction);
          this.actions = related.actions;
          this.pagination = related.pagination;
          return of(true);
        }),
        map(() => {
        })
      ).subscribe();
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * Initialize pagination
   */
  initPagination(): void {
    this.pagination.size = 10;
    this.pagination.page = 0;
  }

  /**
   * Get recent actions on page
   *
   * @param page Page Index
   * @param size Page Size
   * @param sort Sort by
   * @param order Asc | Desc
   * @param search Search query
   * @returns pagination and recent actions
   */
  getRecentActions(
    page: number = 0,
    size: number = 10,
    sort: string,
    order: 'asc' | 'desc' | '' = 'asc',
    search: string = ''
  ): { pagination: ThinqRelationPagination; actions: RecentAction[] } {

    let actions: RecentAction[] | null = cloneDeep(this.totalActions);
    if (sort === 'Description' || sort === 'TimeStamp') {
      actions.sort((a, b) => (a[sort] > b[sort]) ? 1 : ((b[sort] > a[sort]) ? -1 : 0));
      actions = order === 'asc' ? actions : actions.reverse();
    }

    // If search exists...
    if (search) {
      // Filter the products
      actions = actions.filter(action => action.Abstract && action.Abstract.toLowerCase().includes(search.toLowerCase()));
    }

    // Paginate - Start
    const actionsLength = actions.length;

    // Calculate pagination details
    const begin = page * size;
    const end = Math.min((size * (page + 1)), actionsLength);
    const lastPage = Math.max(Math.ceil(actionsLength / size), 1);

    // Prepare the pagination object
    let pagination: ThinqRelationPagination;

    // If the requested page number is bigger than
    // the last possible page number, return null for
    // products but also send the last possible page so
    // the app can navigate to there
    if (page > lastPage) {
      actions = null;
      pagination = {
        length: actionsLength,
        size: size,
        page: page,
        lastPage: lastPage,
        startIndex: begin,
        endIndex: end - 1
      };
    }
    else {
      // Paginate the results by size
      actions = actions.slice(begin, end);

      // Prepare the pagination mock-api
      pagination = {
        length: actionsLength,
        size: size,
        page: page,
        lastPage: lastPage,
        startIndex: begin,
        endIndex: end - 1
      };
    }
    return {
      pagination: pagination,
      actions: actions
    };
  }

  /**
   * Download document from recent action
   *
   * @param appDataId Document Id
   */
  downloadDocument(appDataId: number): void {
    this._thinqService.downloadDocument(appDataId).subscribe();
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: RecentAction): number {
    return item.AppDataId || index;
  }
}
