import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss']
})
export class ReviewListComponent implements OnInit {
  @Input() reviews: any[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  get visibleReviews() {
    return this.reviews ? this.reviews.filter(r => r.comment && r.comment.trim().length > 0) : [];
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((x, i) => i < rating ? 1 : 0);
  }
}
