import { Injectable } from '@angular/core';

import { NgFilesService } from './ng-files.service';

import {
    NgFilesSelected,
    NgFilesStatus
} from '../declarations';

@Injectable()
export class NgFilesUtilsService {

    private static getRegExp(extensions: string): RegExp {
        return new RegExp(`(.*?)\.(${extensions})$`);
    }

    constructor(private ngFilesService: NgFilesService) {
    }

    public verifyFiles(files: FileList, configId = 'shared'): NgFilesSelected {
        const filesArray = Array.from(files);

        const config = this.ngFilesService.getConfig(configId);
        const maxFilesCount = config.maxFilesCount;
        const totalFilesSize = config.totalFilesSize;
        const acceptExtensions = config.acceptExtensions;

        if (filesArray.length > maxFilesCount) {
            return <NgFilesSelected> {
                status: NgFilesStatus.STATUS_MAX_FILES_COUNT_EXCEED,
                files: filesArray
            };
        }

        const filesWithExceedSize = filesArray.filter((file: File) => file.size > config.maxFileSize);
        if (filesWithExceedSize.length) {
            return <NgFilesSelected> {
                status: NgFilesStatus.STATUS_MAX_FILE_SIZE_EXCEED,
                files: filesWithExceedSize
            };
        }

        let filesSize = 0;
        filesArray.forEach((file: File) => filesSize += file.size);
        if (filesSize > totalFilesSize) {
            return <NgFilesSelected> {
                status: NgFilesStatus.STATUS_MAX_FILES_TOTAL_SIZE_EXCEED,
                files: filesArray
            };
        }

        const filesNotMatchExtensions = filesArray.filter((file: File) => {
            const extensionsList = (acceptExtensions as string)
                .split(', ')
                .map(extension => extension.slice(1))
                .join('|');
            const regexp = NgFilesUtilsService.getRegExp(extensionsList);
            return !regexp.test(file.name.toLowerCase());
        });

        if (filesNotMatchExtensions.length) {
            return <NgFilesSelected> {
                status: NgFilesStatus.STATUS_NOT_MATCH_EXTENSIONS,
                files: filesNotMatchExtensions
            };
        }

        return <NgFilesSelected> {
            status: NgFilesStatus.STATUS_SUCCESS,
            files: filesArray
        };
    }

}
