import {
  Component,
  Input,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { TimelineEvent } from './timeline-event';
import { zoom } from 'd3-zoom';
import { select, event } from 'd3-selection';
import { Orientation } from './orientation';
import { Store } from './store/store';
import * as fromActions from './store/actions';
import { ZoomService } from './zoom.service';

@Component({
  selector: 'ngx-d3timeline',
  template: `
    <svg
      #svgEl
      *ngIf="(store.stateWithScales$ | async).view as view"
      [attr.width]="view.width"
      [attr.height]="view.height"
      class="ngx-d3timeline"
    >
      <g ngx-d3timeline-resources-axis></g>
      <g ngx-d3timeline-time-axis></g>
      <g ngx-d3timeline-content></g>
    </svg>
  `,
  styles: []
})
export class NgxD3timelineComponent implements AfterViewInit {
  @Input() set data(value: TimelineEvent[]) {
    this.store.dispatch(new fromActions.DataChangedAction(value));
  }

  @Input() set view([width, height]: [number, number]) {
    this.store.dispatch(new fromActions.ViewChangedAction([width, height]));
  }

  @Input() set orientation(value: Orientation) {
    this.store.dispatch(new fromActions.OrientationChangedAction(value));
  }

  @ViewChild('svgEl') svgEl: ElementRef;

  constructor(public store: Store, private zoomService: ZoomService) {}

  ngAfterViewInit(): void {
    if (this.svgEl) {
      const onZoom = zoom().on('zoom', () => this.zoomService.onZoom(event));
      onZoom(select(this.svgEl.nativeElement));
    }
  }
}
