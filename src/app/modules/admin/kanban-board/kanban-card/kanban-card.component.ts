import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'kanban-card',
  templateUrl: './kanban-card.component.html',
  styleUrls: ['./kanban-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class KanbanCardComponent implements OnInit {

  @Input() card: any;
  constructor() { }

  ngOnInit(): void {
  }

}
