import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private service:AuthService) { }

  ngOnInit(): void {
  }

  getUser(){
    this.service.getUser(1).subscribe(response=>{
      console.log(response)
    })
  }

}
