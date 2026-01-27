import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    faEnvelope, faPhone, faMapMarkerAlt, faClock,
    faPaperPlane, faCheckCircle, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { PublicService } from 'src/app/core/services/public.service';

@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

    // Icons
    faEnvelope = faEnvelope;
    faPhone = faPhone;
    faMapMarkerAlt = faMapMarkerAlt;
    faClock = faClock;
    faPaperPlane = faPaperPlane;
    faCheckCircle = faCheckCircle;
    faExclamationCircle = faExclamationCircle;
    faFacebook = faFacebook;
    faInstagram = faInstagram;
    faTwitter = faTwitter;

    contactForm: FormGroup;
    isSubmitting = false;
    isSubmitted = false;
    errorMessage = '';

    contactInfo = [
        { icon: this.faEnvelope, label: 'Email', value: 'contact@storiom.com' },
        { icon: this.faPhone, label: 'Téléphone', value: '+216 XX XXX XXX' },
    ];

    constructor(
        private fb: FormBuilder,
        private publicService: PublicService
    ) {
        this.contactForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            subject: ['', Validators.required],
            message: ['', [Validators.required, Validators.minLength(10)]]
        });
    }

    ngOnInit(): void {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }, 0);
    }

    onSubmit() {
        if (this.contactForm.invalid) return;

        this.isSubmitting = true;
        this.errorMessage = '';

        const formData = this.contactForm.value;

        this.publicService.sendContactMessage(formData).subscribe({
            next: (response) => {
                this.isSubmitting = false;
                if (response.success) {
                    this.isSubmitted = true;
                    this.contactForm.reset();

                    // Reset success message after 10 seconds
                    setTimeout(() => {
                        this.isSubmitted = false;
                    }, 10000);
                } else {
                    this.errorMessage = response.message || 'Une erreur est survenue';
                }
            },
            error: (err) => {
                this.isSubmitting = false;
                this.errorMessage = err.error?.message || 'Une erreur est survenue lors de l\'envoi';
                console.error('Contact form error:', err);
            }
        });
    }
}
