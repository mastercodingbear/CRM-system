/* eslint-disable @typescript-eslint/naming-convention */
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { TaskInfoCard } from '@core/project-management/pm.type';

@Component({
  selector: 'pm-task-card',
  templateUrl: './pm-task-card.component.html',
  encapsulation: ViewEncapsulation.None
})
export class PMTaskCardComponent implements OnInit {

  @Input() status: string;
  @Input() type: string;
  @Input() count: number;
  @Input() selected: boolean;
  @Output() clickCard: EventEmitter<TaskInfoCard> = new EventEmitter<TaskInfoCard>();

  constructor() { }

  /**
   * On init
   */
  ngOnInit(): void {
  }

  /**
   * Click task card
   */
  onClickCard(): void {
    this.clickCard.emit({
      status: this.status,
      type: this.type
    });
  }

  /**
   * Get task card color with status & type
   *
   * @param status Task status
   * @param type Task type
   * @returns Task card color
   */
  getTaskCardColor(status: string, type: string): string {
    if (type === 'Bug') {
      return 'red-400';
    }
    const statusColor = {
      'Doing': 'teal-400',
      'Agenda': 'gray-600',
      'Nextaction': 'blue-400',
      'QA': 'yellow-500',
      'Concept': 'pink-500',
      'Waitingfor': 'orange-400',
      'Open': 'indigo-400'
    };
    return statusColor[status] || 'teal-400';
  }

  /**
   * Get task card class
   *
   * @param status Task status
   * @param type Task type
   * @returns Task card class
   */
  getTaskCardClass(status: string, type: string): string {
    const cardColor = this.getTaskCardColor(status, type);
    let cardClass = `border-${cardColor} hover:bg-${cardColor}`;
    cardClass += this.selected ? ` bg-${cardColor} text-white` : ' bg-card';
    return cardClass;
  }
}
