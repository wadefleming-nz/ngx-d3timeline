import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Line } from '../line';
@Component({
  selector: '[ngx-d3timeline-axis-line]',
  template: `
    <svg:line
      class="axis-line"
      [attr.x1]="axisLine.x1"
      [attr.x2]="axisLine.x2"
      [attr.y1]="axisLine.y1"
      [attr.y2]="axisLine.y2"
    ></svg:line>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxisLineComponent {
  @Input() axisLine: Line;
}
