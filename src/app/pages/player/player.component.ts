import { Component, OnInit } from '@angular/core';
import { StreamState } from 'src/app/interfaces/stream-state';
import { AudioService } from 'src/app/services/audio.service';
import { CloudService } from 'src/app/services/cloud.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  files: Array<any> = [
    { name: "First Song", artist: "Jess" },
    { name: "Second Song", artist: "Jess" },
  ]

  state: StreamState;
  currentFile = { file: '', index: 0 };

  constructor(
    public audioService: AudioService,
    public cloudService: CloudService,
  ) {
    this.cloudService.getFiles().subscribe(files => this.files = files);

    this.audioService.getState().subscribe(state => this.state = state);
  }

  ngOnInit() {
  }


  isFirstPlaying() {
    return this.currentFile.index === 0;
  }


  isLastPlaying() {
    return this.currentFile.index === this.files.length - 1;
  }


  playStream(url) {
    this.audioService.playStream(url).subscribe(events => console.log(events));
  }


  openFile(file, index) {
    this.currentFile = { file, index };
    this.audioService.stop();
    this.playStream(file.url);
  }


  pause() {
    this.audioService.pause();
  }


  play() {
    this.audioService.play();
  }


  stop() {
    this.audioService.stop();
  }


  next() {
    const index = this.currentFile.index + 1;
    const file = this.files[index];
    this.openFile(file, index)
  }


  previous() {
    const index = this.currentFile.index - 1;
    const file = this.files[index];
    this.openFile(file, index)
  }


  onSliderChangeEnd(change) {
    this.audioService.seekTo(change.value);
  }
}
