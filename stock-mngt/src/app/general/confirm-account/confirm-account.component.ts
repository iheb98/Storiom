import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-confirm-account',
  templateUrl: './confirm-account.component.html',
  styleUrls: ['./confirm-account.component.scss']
})
export class ConfirmAccountComponent implements OnInit {

  message = '';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService

  ) { }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.authService.confirmAccount(token).subscribe(response => {
        console.log(response)
        Swal.fire({
          icon: 'success',
          title: response.message,
          showConfirmButton: false,
          timer: 3000
        })
        this.loading = false;
        this.router.navigate(['/login']);
      }, (error) => {
        console.log(error)
        Swal.fire({
          icon: 'error',
          title: error.error,
          showConfirmButton: false,
          timer: 3000
        })
        this.router.navigate(['/login']);
      }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Aucun token fourni',
        showConfirmButton: false,
        timer: 3000
      })
    }
  }
}
