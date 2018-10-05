import {
  Component,
  OnInit,
  DoCheck,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';

import {
  NgFilesService,
  NgFilesUtilsService
} from '../../services';

import { NgFilesSelected } from '../../declarations/ng-files-selected';

@Component({
  selector: 'app-ng-files-drag-n-upload',
  templateUrl: './ng-files-drag-n-upload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgFilesDragNUploadComponent implements OnInit, DoCheck {


  @Input() configId = 'shared';

  @Output() filesSelect: EventEmitter<NgFilesSelected> = new EventEmitter<NgFilesSelected>();

  @HostListener('dragenter', ['$event'])
  public onDragEnter(event: any) {
    this.preventEvent(event);
  }

  @HostListener('dragover', ['$event'])
  public onDragOver(event: any) {
    this.preventEvent(event);
  }

  @HostListener('drop', ['$event'])
  public onDrop(event: any) {
    this.preventEvent(event);

    if (!event.dataTransfer || !event.dataTransfer.files) {
      return;
    }

    this.dropFilesHandler(event.dataTransfer.files);
  }

  public maxFilesCount: number;
  public acceptExtensions: string;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private ngFilesService: NgFilesService,
    private ngFilesUtilsService: NgFilesUtilsService
  ) { }


  ngOnInit() {
    const config = this.ngFilesService.getConfig(this.configId);

    this.maxFilesCount = config.maxFilesCount;
    this.acceptExtensions = <string>config.acceptExtensions;
  }

  public onChange(files: FileList): void {
    if (!files.length) {
      return;
    }

    this.filesSelect.emit(
      this.ngFilesUtilsService.verifyFiles(files, this.configId)
    );
  }
  ngDoCheck() {
    this.changeDetector.detectChanges();
  }

  private dropFilesHandler(files: FileList) {
    this.filesSelect.emit(
      this.ngFilesUtilsService.verifyFiles(files, this.configId)
    );
  }

  private preventEvent(event: any): void {
    event.stopPropagation();
    event.preventDefault();
  }
}
