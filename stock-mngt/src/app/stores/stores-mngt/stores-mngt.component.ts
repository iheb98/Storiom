import { Component, OnInit } from '@angular/core';
import { faArrowAltCircleRight } from '@fortawesome/free-regular-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-stores-mngt',
  templateUrl: './stores-mngt.component.html',
  styleUrls: ['./stores-mngt.component.scss']
})
export class StoresMngtComponent implements OnInit {
  faArrowAltCircleRight = faArrowAltCircleRight;
  faDelete = faTrash;
  faEdit = faEdit;
  faPlus = faPlus
  constructor() { }

  ngOnInit(): void {
  }

}
