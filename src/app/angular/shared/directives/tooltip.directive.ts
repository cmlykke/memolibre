import { Directive, ElementRef, HostListener, Input, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { GlobalStateService } from '../services/global-state-service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnInit, OnDestroy {
  @Input() tooltipMessage: string = '';
  private tooltipElement: HTMLElement | null = null;
  private isMobile: boolean = false;
  private timeoutId: any;
  private showTooltips: boolean = true;
  private stateSubscription!: Subscription;
  private isMouseOverTooltip: boolean = false; // New flag to track if mouse is over tooltip

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private globalStateService: GlobalStateService
  ) {}

  ngOnInit() {
    this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.stateSubscription = this.globalStateService.state$.subscribe(state => {
      this.showTooltips = state.appSettings['showTooltips'] === 'true';
    });
  }

  ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    this.hideTooltip();
  }

  @HostListener('mouseenter') onMouseEnter() {
    if (!this.isMobile && this.showTooltips) {
      this.showTooltip();
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (!this.isMobile) {
      // Delay hiding to allow mouse to move to tooltip
      setTimeout(() => {
        if (!this.isMouseOverTooltip) {
          this.hideTooltip();
        }
      }, 100); // 100ms delay
    }
  }

  private showTooltip() {
    if (!this.tooltipMessage) return;

    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.setStyle(this.tooltipElement, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipElement, 'background', '#333');
    this.renderer.setStyle(this.tooltipElement, 'color', '#fff');
    this.renderer.setStyle(this.tooltipElement, 'padding', '5px 10px');
    this.renderer.setStyle(this.tooltipElement, 'borderRadius', '4px');
    this.renderer.setStyle(this.tooltipElement, 'fontSize', '12px');
    this.renderer.setStyle(this.tooltipElement, 'zIndex', '1000');

    const text = this.renderer.createText(this.tooltipMessage);
    this.renderer.appendChild(this.tooltipElement, text);

    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const wrapper = this.el.nativeElement.parentElement; // The wrapper (e.g., button or .input-wrapper)
    const wrapperPos = wrapper.getBoundingClientRect();

    // Position relative to the wrapper's top-left corner
    const topOffset = hostPos.top - wrapperPos.top + 5; // 5px below the ? icon
    const leftOffset = hostPos.left - wrapperPos.left + 5; // 5px right of the ? icon

    this.renderer.setStyle(this.tooltipElement, 'top', `${topOffset}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${leftOffset}px`);

    this.renderer.appendChild(wrapper, this.tooltipElement); // Append to wrapper

    // Add event listeners to the tooltip
    this.renderer.listen(this.tooltipElement, 'mouseenter', () => {
      this.isMouseOverTooltip = true;
    });
    this.renderer.listen(this.tooltipElement, 'mouseleave', () => {
      this.isMouseOverTooltip = false;
      this.hideTooltip();
    });
  }

  private hideTooltip() {
    if (this.tooltipElement && this.tooltipElement.parentElement) {
      this.renderer.removeChild(this.tooltipElement.parentElement, this.tooltipElement);
      this.tooltipElement = null;
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  @HostListener('click', ['$event']) onClick(event: Event) {
    if (this.isMobile && this.showTooltips) {
      event.stopPropagation();
      if (this.tooltipElement) {
        this.hideTooltip();
      } else {
        this.showTooltip();
        this.timeoutId = setTimeout(() => this.hideTooltip(), 3000);
      }
    }
  }
}
