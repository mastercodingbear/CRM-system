import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map } from 'rxjs';


interface SearchForm {
  cabinet: string;
  searchField: string;
  searchQuery: string;
}

@Component({
  selector: 'thinq-relation-search',
  templateUrl: './relation-search.component.html',
  encapsulation: ViewEncapsulation.None
})
export class RelationSearchComponent implements OnInit {

  @Input() enabledClasses: string[];
  @Input() classFields: string[];
  @Output() selectCabinet: EventEmitter<string> = new EventEmitter<string>();
  @Output() searchNewRelation: EventEmitter<SearchForm> = new EventEmitter<SearchForm>();
  cabinetControl: FormControl = new FormControl();
  fieldControl: FormControl = new FormControl();
  searchInputControl: FormControl = new FormControl();
  constructor() { }

  ngOnInit(): void {
    // Trigger cabinet dropdown value changes
    this.cabinetControl.valueChanges
      .pipe(
        map((value) => {
          this.selectCabinet.emit(value);
        })
      ).subscribe();
  }

  /**
   * Search relationships
   */
  searchNewRelationships(): void {
    this.searchNewRelation.emit({
      cabinet: this.cabinetControl.value,
      searchField: this.fieldControl.value,
      searchQuery: this.searchInputControl.value
    });
  }
}
