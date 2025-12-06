import { Component } from '@angular/core';
import { Navbar } from "../../components/navbar/navbar";
import { Footer } from "../../components/footer/footer";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-with-nav-layout',
  imports: [Navbar, RouterOutlet, Footer],
  templateUrl: './public-with-nav-layout.html',
  styleUrl: './public-with-nav-layout.css',
})
export class PublicWithNavLayout {

}
