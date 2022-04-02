import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { groupBy } from 'lodash-es';
import { PMCountTaskInfo, PMTaskType, TaskInfoCard } from '@core/project-management/pm.type';


@Component({
  selector: 'pm-side-screen',
  templateUrl: './pm-side-screen.component.html'
})
export class PMSideScreenComponent implements OnInit {

  @Input() countTaskInfo: PMCountTaskInfo;
  @Input() selectedStatus: string;
  @Output() closeScreen: EventEmitter<boolean> = new EventEmitter();
  @Output() selectCard: EventEmitter<TaskInfoCard> = new EventEmitter();

  totalCountByType: Record<string, PMTaskType[]> = {};
  selectedCard: TaskInfoCard = null;

  constructor() { }

  /**
   * On init
   */
  ngOnInit(): void {
    this.totalCountByType = groupBy(this.countTaskInfo.taskType, 'Status');
  }

  /**
   * Close side screen
   */
  close(): void {
    this.closeScreen.emit(true);
  }

  /**
   * Select task card and filter
   *
   * @param status Task status
   * @param type Task type
   */
  onTaskCardClick(status: string, type: string): void {
    if (this.isCardSelected(status, type)) {
      this.selectedCard = null;
    } else {
      this.selectedCard = {
        status: status,
        type: type
      };
    }
    this.selectCard.emit(this.selectedCard);
  }

  /**
   * Card selected or not?
   *
   * @param status Task status
   * @param type Task type
   * @returns Is selected?
   */
  isCardSelected(status: string, type: string): boolean {
    return (status === this.selectedCard?.status && type === this.selectedCard?.type);
  }
}
