import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'total-info-card',
  templateUrl: './total-info-card.component.html',
  styleUrls: ['./total-info-card.component.scss']
})
export class TotalInfoCardComponent implements OnInit {

  @Input() opportunityCount: number;
  @Input() customerCount: number;
  @Input() totalRevenue: number;

  constructor() { }

  ngOnInit(): void {
  }

}
