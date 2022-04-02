import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.scss']
})
export class DashboardCardComponent implements OnInit {

  @Input() title: string;
  @Input() titleClass: string = '';
  @Input() subTitle: string;
  @Input() subTitleClass: string;
  @Input() description: string;
  @Input() descriptionClass: string;
  @Input() navigateLink: string;

  constructor() { }

  ngOnInit(): void {
  }

}
