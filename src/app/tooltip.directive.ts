// src/app/tooltip.directive.ts
import { Directive, ElementRef, HostListener, Input, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnInit {
  @Input() tooltipMessage: string = ''; // The message to display in the tooltip
  private tooltipElement: HTMLElement | null = null; // The tooltip DOM element
  private isMobile: boolean = false; // Flag to detect mobile devices
  private timeoutId: any; // For auto-hiding the tooltip on mobile

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    // Detect if the device supports touch (mobile)
    this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  // Show tooltip on hover (desktop only)
  @HostListener('mouseenter') onMouseEnter() {
    if (!this.isMobile) {
      this.showTooltip();
    }
  }

  // Hide tooltip when leaving hover (desktop only)
  @HostListener('mouseleave') onMouseLeave() {
    if (!this.isMobile) {
      this.hideTooltip();
    }
  }

  // Handle tap on mobile
  @HostListener('click', ['$event']) onClick(event: Event) {
    if (this.isMobile) {
      event.stopPropagation(); // Prevent button action when tapping the icon
      if (this.tooltipElement) {
        this.hideTooltip(); // Hide if already visible
      } else {
        this.showTooltip(); // Show and auto-hide after 3 seconds
        this.timeoutId = setTimeout(() => this.hideTooltip(), 3000);
      }
    }
  }

  private showTooltip() {
    if (!this.tooltipMessage) return;

    // Create the tooltip element
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.setStyle(this.tooltipElement, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipElement, 'background', '#333');
    this.renderer.setStyle(this.tooltipElement, 'color', '#fff');
    this.renderer.setStyle(this.tooltipElement, 'padding', '5px 10px');
    this.renderer.setStyle(this.tooltipElement, 'borderRadius', '4px');
    this.renderer.setStyle(this.tooltipElement, 'fontSize', '12px');
    this.renderer.setStyle(this.tooltipElement, 'zIndex', '1000');

    // Add the tooltip message
    const text = this.renderer.createText(this.tooltipMessage);
    this.renderer.appendChild(this.tooltipElement, text);

    // Position the tooltip above the host element
    const hostPos = this.el.nativeElement.getBoundingClientRect();
    this.renderer.setStyle(this.tooltipElement, 'top', `${hostPos.top - 40}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${hostPos.left}px`);

    // Append to the document body
    this.renderer.appendChild(document.body, this.tooltipElement);
  }

  private hideTooltip() {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
