import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconRegistryService } from './core/services/icon-registry.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Form Constructor';
  
  constructor(private iconRegistryService: IconRegistryService) {}
  
  ngOnInit(): void {
    // Register all icons used in the application
    this.iconRegistryService.registerIcons();
  }
}
