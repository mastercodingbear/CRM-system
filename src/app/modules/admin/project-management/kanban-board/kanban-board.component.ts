import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subject, takeUntil } from 'rxjs';
import { groupBy } from 'lodash';
import { PMKanbanBoardService } from './kanban-board.service';
import { FormGroup } from '@angular/forms';
import { PMKanbanProject } from '@core/project-management/pm.type';

@Component({
  selector: 'pm-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PMKanbanBoardComponent implements OnInit, OnDestroy {

  kanbanLists: Record<string, PMKanbanProject[]>;
  projectTasks: PMKanbanProject[];
  objectKeys = Object.keys;

  private readonly _positionStep: number = 65536;
  private readonly _maxListCount: number = 200;
  private readonly _maxPosition: number = this._positionStep * 500;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  constructor(
    private _pmKanbanService: PMKanbanBoardService
  ) { }

  /**
   * On init
   */
  ngOnInit(): void {
    // Get the tasks
    this._pmKanbanService.tasks$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: PMKanbanProject[]) => {
        this.projectTasks = response;
        this.generateBoard(this.projectTasks);
      });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * Generate kanban board lists
   *
   * @param tasks Project Tasks
   * @param group Kanban Group By
   */
  generateBoard(tasks: PMKanbanProject[], group: string = 'Status'): void {
    this.kanbanLists = groupBy(tasks, group);
  }

  /**
   * Search tasks
   *
   * @param searchForm Search FormGroup
   */
  onSearchTask(searchForm: FormGroup): void {
    this._pmKanbanService.getTasks(searchForm).subscribe();
  }

  /**
   * Card dropped
   *
   * @param event
   */
  cardDropped(event: CdkDragDrop<any[]>): void {
    // Move or transfer the item
    if (event.previousContainer === event.container) {
      // Move the item
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Transfer the item
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

      // Update the card's list it
      event.container.data[event.currentIndex].listId = event.container.id;
    }

    // Calculate the positions
    const updated = this._calculatePositions(event);

    // Update the cards
    // this._pmKanbanService.updateCards(updated).subscribe();
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

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Calculate and set item positions
   * from given CdkDragDrop event
   *
   * @param event
   * @private
   */
  private _calculatePositions(event: CdkDragDrop<any[]>): any[] {
    // Get the items
    let items = event.container.data;
    const currentItem = items[event.currentIndex];
    const prevItem = items[event.currentIndex - 1] || null;
    const nextItem = items[event.currentIndex + 1] || null;

    // If the item moved to the top...
    if (!prevItem) {
      // If the item moved to an empty container
      if (!nextItem) {
        currentItem.position = this._positionStep;
      }
      else {
        currentItem.position = nextItem.position / 2;
      }
    }
    // If the item moved to the bottom...
    else if (!nextItem) {
      currentItem.position = prevItem.position + this._positionStep;
    }
    // If the item moved in between other items...
    else {
      currentItem.position = (prevItem.position + nextItem.position) / 2;
    }

    // Check if all item positions need to be updated
    if (!Number.isInteger(currentItem.position) || currentItem.position >= this._maxPosition) {
      // Re-calculate all orders
      items = items.map((value, index) => {
        value.position = (index + 1) * this._positionStep;
        return value;
      });

      // Return items
      return items;
    }

    // Return currentItem
    return [currentItem];
  }
}
