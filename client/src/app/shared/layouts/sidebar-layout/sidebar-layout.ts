import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Navbar } from "../../components/navbar/navbar";

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
}

export interface MenuSection {
  section: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Navbar],
  templateUrl: './sidebar-layout.html',
  styleUrl: './sidebar-layout.css',
})
export class SidebarLayout {
  title = input<string>('Dashboard');
  subtitle = input<string>('');
  menuItems = input<MenuSection[]>([]);
}
