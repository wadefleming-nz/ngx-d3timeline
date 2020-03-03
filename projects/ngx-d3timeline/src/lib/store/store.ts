import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ActionType } from './actions';
import { shareReplay, scan } from 'rxjs/operators';
import { initialState } from './state';
import { State } from './state';
import { TimelineView } from '../view/timeline-view';
import { Actions } from './actions';
import { TimelineDragEvent } from '../content/timeline-drag-event';
import { EventRectangle } from '../content/event-rectangle';
import { getDropTimelineEvent } from '../drag-util';
import { TimelineEvent } from '../timeline-event';
import {
  rescaleTime,
  configureTimeScale,
  configureBandScale
} from '../scale-util';
import { flipOrientation } from '../orientation-utils';
import { Orientation } from '../orientation';
import { AxisOrientations } from '../axis-orientations';

@Injectable({ providedIn: 'root' })
export class Store {
  private readonly replayBufferSize = 100;
  private actionsSubject = new ReplaySubject<Actions>(this.replayBufferSize);

  state$ = this.actionsSubject.pipe(
    scan(this.reducer.bind(this), initialState),
    shareReplay()
  );

  dispatch(action: Actions) {
    this.actionsSubject.next(action);
  }

  private reducer(state: State, action: Actions): State {
    switch (action.type) {
      case ActionType.DataChanged: {
        return this.patchStateAndUpdateScales(state, { data: action.payload });
      }

      case ActionType.OrientationChanged: {
        return this.patchStateAndUpdateScales(state, {
          axisOrientations: this.setAxisOrientations(action.payload)
        });
      }

      case ActionType.ViewChanged: {
        return this.patchStateAndUpdateScales(state, {
          view: new TimelineView(action.payload)
        });
      }

      case ActionType.Zoomed: {
        return {
          ...state,
          timeScale: rescaleTime(
            state.data,
            state.view,
            state.axisOrientations.time,
            action.payload
          )
        };
      }

      case ActionType.TimelineDragStarted:
      case ActionType.TimelineDragging: {
        return {
          ...state,
          dragEvent: this.setDragEvent(
            state.dragEvent,
            action.payload.eventRectangle,
            action.payload.event
          )
        };
      }

      case ActionType.TimelineDragEnded: {
        const data = this.dropTimelineEventOnDragEnd(state);
        return { ...state, data, dragEvent: null };
      }

      default: {
        return state;
      }
    }
  }

  private dropTimelineEventOnDragEnd(state: State): TimelineEvent[] {
    const dropEvent = getDropTimelineEvent(state);
    return state.data.map(data =>
      data.id === dropEvent.id ? dropEvent : data
    );
  }

  private patchStateAndUpdateScales(state: State, patch: Partial<State>) {
    const patchedState = { ...state, ...patch };
    return {
      ...patchedState,
      timeScale: configureTimeScale(
        patchedState.data,
        patchedState.view,
        patchedState.axisOrientations.time
      ),
      bandScale: configureBandScale(
        patchedState.data,
        patchedState.view,
        patchedState.axisOrientations.resource
      )
    };
  }

  private setDragEvent(
    dragEvent: TimelineDragEvent,
    eventRectangle: EventRectangle,
    event: any
  ) {
    return {
      ...dragEvent,
      id: eventRectangle.id,
      dx: dragEvent && dragEvent.dx + event.dx,
      dy: dragEvent && dragEvent.dy + event.dy,
      x: event.x,
      y: event.y
    };
  }

  private setAxisOrientations(timeOrientation: Orientation): AxisOrientations {
    const resourceOrientation = flipOrientation(timeOrientation);
    return { time: timeOrientation, resource: resourceOrientation };
  }
}
