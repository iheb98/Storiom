import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { faFire, faBox, faTimes, faChevronLeft, faChevronRight, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { StatService } from 'src/app/core/services/stat.service';

@Component({
    selector: 'app-all-sold-products-modal',
    templateUrl: './all-sold-products-modal.component.html',
    styleUrls: ['./all-sold-products-modal.component.scss']
})
export class AllSoldProductsModalComponent implements OnInit {
    // Icons
    faFire = faFire;
    faBox = faBox;
    faTimes = faTimes;
    faChevronLeft = faChevronLeft;
    faChevronRight = faChevronRight;
    faTrophy = faTrophy;

    user;
    allProducts = [];
    displayedProducts = [];

    // Pagination
    currentPage = 1;
    pageSize = 10;
    totalPages = 1;

    // Loading
    isLoading = true;

    constructor(
        private statService: StatService,
        private authService: AuthService,
        private router: Router,
        public dialogRef: MatDialogRef<AllSoldProductsModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit(): void {
        this.user = this.authService.getConnectedUser();
        this.loadAllProducts();
    }

    loadAllProducts() {
        this.isLoading = true;
        this.statService.getMostSoldProducts(this.user?.store).subscribe(
            response => {
                this.allProducts = response;
                this.totalPages = Math.ceil(this.allProducts.length / this.pageSize);
                this.updateDisplayedProducts();
                this.isLoading = false;
            },
            error => {
                this.isLoading = false;
            }
        );
    }

    updateDisplayedProducts() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.displayedProducts = this.allProducts.slice(startIndex, endIndex);
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.updateDisplayedProducts();
        }
    }

    previousPage() {
        this.goToPage(this.currentPage - 1);
    }

    nextPage() {
        this.goToPage(this.currentPage + 1);
    }

    getGlobalRank(localIndex: number): number {
        return (this.currentPage - 1) * this.pageSize + localIndex + 1;
    }

    getRankClass(rank: number): string {
        if (rank === 1) return 'gold';
        if (rank === 2) return 'silver';
        if (rank === 3) return 'bronze';
        return '';
    }

    close() {
        this.dialogRef.close();
    }

    goToProduct(productId: number) {
        if (productId) {
            this.dialogRef.close();
            this.router.navigate(['/admin/products/view/' + productId]);
        }
    }
}
