import { Component } from '@angular/core';
import { LucideAngularModule, FileIcon, SearchIcon, CircleUser, FileUp, Contact } from 'lucide-angular';

@Component({
  selector: 'app-how-it-works',
  imports: [LucideAngularModule],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.css',
})
export class HowItWorks {
  readonly FileUp = FileUp;
  readonly SearchIcon = SearchIcon;
  readonly CircleUser = CircleUser;
  readonly ContactUser = Contact;

  public items = [
    {
      icon: CircleUser,
      title: 'Create Account',
      detail: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate facilis debitis
            accusamus illo! Dicta vero dolores iure, maiores magni praesentium enim mollitia quaerat! Ab
            adipisci at reiciendis minima quasi nam?`,
    },
    {
      icon: FileUp,
      title: 'Upload Resume',
      detail: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate facilis debitis
            accusamus illo! Dicta vero dolores iure, maiores magni praesentium enim mollitia quaerat! Ab
            adipisci at reiciendis minima quasi nam?`,
    },
    {
      icon: SearchIcon,
      title: 'Search Jobs',
      detail: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate facilis debitis
            accusamus illo! Dicta vero dolores iure, maiores magni praesentium enim mollitia quaerat! Ab
            adipisci at reiciendis minima quasi nam?`,
    },
    {
      icon: this.ContactUser,
      title: 'Apply to Dream Job',
      detail: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate facilis debitis
            accusamus illo! Dicta vero dolores iure, maiores magni praesentium enim mollitia quaerat! Ab
            adipisci at reiciendis minima quasi nam?`,
    },
  ];
}
