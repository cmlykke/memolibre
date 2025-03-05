import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActionButtonService {
  private buttonActionSubject = new BehaviorSubject<() => void>(() => {});
  private buttonTextSubject = new BehaviorSubject<string>('Action');
  private buttonVisibleSubject = new BehaviorSubject<boolean>(false);

  buttonAction$: Observable<() => void> = this.buttonActionSubject.asObservable();
  buttonText$: Observable<string> = this.buttonTextSubject.asObservable();
  buttonVisible$: Observable<boolean> = this.buttonVisibleSubject.asObservable();

  setButtonBehavior(action: () => void, text: string, visible: boolean): void {
    this.buttonActionSubject.next(action);
    this.buttonTextSubject.next(text);
    this.buttonVisibleSubject.next(visible);
  }

  clearButtonBehavior(): void {
    this.buttonActionSubject.next(() => {});
    this.buttonTextSubject.next('Action');
    this.buttonVisibleSubject.next(false);
  }
}
