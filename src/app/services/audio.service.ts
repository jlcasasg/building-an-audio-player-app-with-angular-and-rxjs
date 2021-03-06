import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { StreamState } from '../interfaces/stream-state';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private stop$ = new Subject();
  private audioObj = new Audio();

  audioEvents = [
    "ended",
    "error",
    "play",
    "playing",
    "pause",
    "timeUpdate",
    "canPlay",
    "loadMetadata",
    "loadStart",
  ];

  private state: StreamState = {
    playing: false,
    readableCurrentTime: '',
    readableDuration: '',
    duration: undefined,
    currentTime: undefined,
    canplay: false,
    error: false,
  };

  private stateChange: BehaviorSubject<StreamState> = new BehaviorSubject(this.state);

  constructor() { }


  private streamObservable(url) {
    return new Observable(observer => {
      //Play audio
      this.audioObj.src = url;
      this.audioObj.load();
      this.audioObj.play();

      const handler = (event: Event) => {
        this.updateStateEvents(event);
        observer.next(event);
      }

      this.addEvents(this.audioObj, this.audioEvents, handler);

      return () => {
        // Stop playing
        this.audioObj.pause();
        this.audioObj.currentTime = 0;

        // Remove event listeners
        this.removeEvents(this.audioObj, this.audioEvents, handler);
        this.resetState();
      };
    });
  }


  private addEvents(obj, events, handler) {
    events.forEach(event => {
      obj.addEventListener(event, handler);
    });
  }


  private removeEvents(obj, events, handler) {
    events.forEach(event => {
      obj.removeEventListener(event, handler);
    });
  }


  playStream(url) {
    return this.streamObservable(url).pipe(takeUntil(this.stop$));
  }


  play() {
    this.audioObj.play();
  }


  pause() {
    this.audioObj.pause();
  }


  stop() {
    this.stop$.next();
  }


  seekTo(seconds) {
    this.audioObj.currentTime = seconds;
  }


  formatTime(time: number, format: string = "HH:mm:ss") {
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }


  private updateStateEvents(event: Event): void {
    switch (event.type) {
      case "canPlay":
        this.state.duration = this.audioObj.duration;
        this.state.readableDuration = this.formatTime(this.state.duration);
        this.state.canplay = true;
        break;
      case "playing":
        this.state.playing = true;
        break;
      case "pause":
        this.state.playing = false;
        break;
      case "timeUpdate":
        this.state.currentTime = this.audioObj.currentTime;
        this.state.readableCurrentTime = this.formatTime(this.state.currentTime);
        break;
      case "error":
        this.resetState();
        this.state.error = true;
        break;
    }

    this.stateChange.next(this.state);
  }


  resetState() {
    this.state = {
      playing: false,
      readableCurrentTime: '',
      readableDuration: '',
      duration: undefined,
      currentTime: undefined,
      canplay: false,
      error: false,
    };
  }

  getState(): Observable<StreamState> {
    return this.stateChange.asObservable();
  }
}
