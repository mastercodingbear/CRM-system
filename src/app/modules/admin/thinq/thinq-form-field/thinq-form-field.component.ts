import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThinqFormField } from '@core/thinq/thinq.type';

@Component({
  selector: 'thinq-form-field',
  templateUrl: './thinq-form-field.component.html',
  styleUrls: ['./thinq-form-field.component.scss']
})
export class ThinqFormfieldComponent implements OnInit {

  @Input() control: FormControl;
  @Input() txlIdField: FormControl;
  @Input() arrField: ThinqFormField;
  @Input() labelVisibility: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

}
