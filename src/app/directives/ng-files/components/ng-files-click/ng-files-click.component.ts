import {
  Component,
  OnInit,
  DoCheck,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import {
  NgFilesService,
  NgFilesUtilsService
} from '../../services';

import { NgFilesSelected } from '../../declarations/ng-files-selected';

@Component({
    selector: 'ng-files-click', // tslint:disable-line
    templateUrl: './ng-files-click.component.html',
    styles: ['.ng-files-upload-btn { display: none; }'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgFilesClickComponent implements OnInit, DoCheck {

  @Input() configId = 'shared';

  @Output() filesSelect: EventEmitter<NgFilesSelected> = new EventEmitter<NgFilesSelected>();

  public maxFilesCount: number;
  public acceptExtensions: string;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private ngFilesService: NgFilesService,
    private ngFilesUtilsService: NgFilesUtilsService
  ) {}

  ngDoCheck() {
    this.changeDetector.detectChanges();
  }

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

}
