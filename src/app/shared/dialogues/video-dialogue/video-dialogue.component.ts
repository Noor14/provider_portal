import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-video-dialogue',
  templateUrl: './video-dialogue.component.html',
  styleUrls: ['./video-dialogue.component.scss']
})
export class VideoDialogueComponent implements OnInit {

  @Input() videoURL: string;
  constructor(
    public _activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
  }

  close() {
    this._activeModal.close()
  }

}
