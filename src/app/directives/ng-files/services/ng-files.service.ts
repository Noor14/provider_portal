import { Injectable } from '@angular/core';

import {
    NgFilesConfig,
    ngFilesConfigDefault
} from '../declarations';

@Injectable()
export class NgFilesService {

    private static readonly ERROR_MSG_PREFIX = 'ngFiles:';

    private configs: { [key: string]: NgFilesConfig } = {};

    private static throwError(
        msg: string,
        type: 'default' | 'range' | 'syntax' | 'reference' = 'default'
    ): never {
        const fullMsg = `${NgFilesService.ERROR_MSG_PREFIX} ${msg}`;

        switch (type) {
            case 'default':
                throw new Error(fullMsg);
            case 'range':
                throw new RangeError(fullMsg);
            case 'syntax':
                throw new SyntaxError(fullMsg);
            case 'reference':
                throw new ReferenceError(fullMsg);
        }
    }

    public addConfig(config: NgFilesConfig, configId = 'shared'): void {
        this.newConfigVerifyPipeline(config);
        this.configs[configId] = config;
    }

    public getConfig(configId = 'shared'): NgFilesConfig {
        if (configId === 'shared' && !this.configs['shared']) {
            this.configs['shared'] = <NgFilesConfig>{};
            this.setDefaultProperties(this.configs['shared']);
        }

        if (!this.configs[configId]) {
            NgFilesService.throwError(`Config '${configId}' is not found`, 'reference');
        }

        return this.configs[configId];
    }

    private newConfigVerifyPipeline(config): void {
        this.isUnique(config)
            .setDefaultProperties(config)
            .isFilesCountValid(config)
            .isAcceptExtensionsValid(config)
            .isFileSizeRangesValid(config)
            .transformAcceptExtensions(config);
    }

    private isUnique(config): NgFilesService {
        const isConfigExist = Object.keys(this.configs).find((key: string) => this.configs[key] === config);
        if (isConfigExist) {
            NgFilesService.throwError('Avoid add the same config more than once');
        }

        return this;
    }

    private setDefaultProperties(config: NgFilesConfig): NgFilesService {
        config.acceptExtensions = config.acceptExtensions || ngFilesConfigDefault.acceptExtensions;
        config.maxFileSize = config.maxFileSize || ngFilesConfigDefault.maxFileSize;
        config.totalFilesSize = config.totalFilesSize || ngFilesConfigDefault.totalFilesSize;
        config.maxFilesCount = config.maxFilesCount === 0 ?
            config.maxFilesCount :
            config.maxFilesCount || ngFilesConfigDefault.maxFilesCount;

        return this;
    }

    private isFilesCountValid(config): NgFilesService {
        if (config.maxFilesCount < 1) {
            const FILES_COUNT_MIN = 1;
            const FILES_COUNT_MAX = Infinity;

            NgFilesService.throwError(`maxFilesCount must be between ${FILES_COUNT_MIN} and ${FILES_COUNT_MAX}`, 'range');
        }

        return this;
    }

    private isAcceptExtensionsValid(config): NgFilesService {
        if (typeof config.acceptExtensions === 'string' && config.acceptExtensions !== '*') {
            NgFilesService.throwError(`acceptanceExtensions type must be "*" or string[]`, 'syntax');
        }

        return this;
    }

    private isFileSizeRangesValid(config): NgFilesService {
        if (config.maxFileSize > config.totalFilesSize) {
            NgFilesService.throwError('maxFileSize must be less than totalFilesSize', 'range');
        }

        return this;
    }

    private transformAcceptExtensions(config): NgFilesService {
        if (
            config.acceptExtensions === '*' ||
            config.acceptExtensions.indexOf('*') !== -1 ||
            Array.isArray(config.acceptExtensions) && config.acceptExtensions.length === 0
        ) {
            config.acceptExtensions = '*/*';
        } else {
            config.acceptExtensions = (config.acceptExtensions as string[])
                .map(extension => '.' + extension.toLowerCase()).join(', ');
        }

        return this;
    }

}
