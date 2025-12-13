import { Component, EventEmitter, Input, OnInit, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PublicService } from 'src/app/core/services/public.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.scss']
})
export class ReviewFormComponent implements OnInit, OnChanges {
  @Input() productId: number;
  @Input() initialReview: any;
  @Output() reviewSubmitted = new EventEmitter<any>();

  reviewForm: FormGroup;
  isSubmitting = false;
  hoveredStar: number = 0;

  constructor(
    private fb: FormBuilder,
    private publicService: PublicService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.initForm();
    if (this.initialReview) {
      this.reviewForm.patchValue({
        rating: this.initialReview.rating,
        comment: this.initialReview.comment
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.initialReview && this.initialReview) {
      if (this.reviewForm) {
        this.reviewForm.patchValue({
          rating: this.initialReview.rating,
          comment: this.initialReview.comment
        });
      }
    }
  }

  initForm() {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['']
    });
  }

  setRating(rating: number) {
    this.reviewForm.patchValue({ rating });
  }

  submitReview() {
    if (this.reviewForm.invalid) {
      this.toastService.showError('Veuillez donner une note valide.');
      return;
    }

    this.isSubmitting = true;
    const reviewData = {
      ...this.reviewForm.value,
      productId: this.productId
    };

    this.publicService.submitReview(reviewData).subscribe(
      (response) => {
        this.isSubmitting = false;
        this.toastService.showSuccess('Merci pour votre avis !');
        this.reviewSubmitted.emit(response);
        this.initForm(); // Reset form
      },
      (error) => {
        this.isSubmitting = false;
        this.toastService.showError('Une erreur est survenue lors de l\'envoi de votre avis.');
      }
    );
  }
}
