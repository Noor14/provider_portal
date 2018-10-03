import {
    Component,
    DoCheck,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    HostListener
} from '@angular/core';

import {
    NgFilesUtilsService
} from '../../services';

import { NgFilesSelected } from '../../declarations';

@Component({
    selector: 'ng-files-drop', // tslint:disable-line
    templateUrl: './ng-files-drop.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgFilesDropComponent implements DoCheck {

    @Input() private configId = 'shared';

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

    constructor(private changeDetector: ChangeDetectorRef,
                private ngFilesUtilsService: NgFilesUtilsService) {
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
