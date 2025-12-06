import { Component } from '@angular/core';
import { Hero } from "../../shared/components/hero/hero";
import { HowItWorks } from "../../shared/components/how-it-works/how-it-works";

@Component({
  selector: 'app-home',
  imports: [Hero, HowItWorks],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
