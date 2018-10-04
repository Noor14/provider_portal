import { NgFilesService } from './ng-files.service';
import {
    NgFilesConfig,
    ngFilesConfigDefault
} from '../declarations';

describe('NgFilesService', () => {

    let sut: NgFilesService,
        mockConfig: NgFilesConfig;

    beforeEach(() => {
        sut = new NgFilesService();

        mockConfig = {
            acceptExtensions: ['py', 'py.tpl', 'gitignore'],
            maxFilesCount: 1111,
            maxFileSize: 2222,
            totalFilesSize: 3333
        };
    });

    describe('throwError', () => {

        it('should add prefix to error msg', () => {
            const expectedResult = new Error(`${(NgFilesService as any).ERROR_MSG_PREFIX} MOCK-MSG`);

            expect(() => (NgFilesService as any).throwError('MOCK-MSG'))
                .toThrow(expectedResult);
        });

        it('should throw Error by default', () => {
            expect(() => (NgFilesService as any).throwError('MOCK-MSG'))
                .toThrowError(Error);
        });

        it('should throw RangeError', () => {
            expect(() => (NgFilesService as any).throwError('MOCK-MSG', 'range'))
                .toThrowError(RangeError);
        });

        it('should throw SyntaxError', () => {
            expect(() => (NgFilesService as any).throwError('MOCK-MSG', 'syntax'))
                .toThrowError(SyntaxError);
        });

        it('should throw ReferenceError', () => {
            expect(() => (NgFilesService as any).throwError('MOCK-MSG', 'reference'))
                .toThrowError(ReferenceError);
        });

    });

    describe('addConfig', () => {

        it('should pass config to verify pipeline', () => {
            const spy = spyOn((sut as any), 'newConfigVerifyPipeline');

            sut.addConfig(mockConfig);

            expect(spy).toHaveBeenCalledWith(mockConfig);
        });

        it('should add config by id if present', () => {
            sut.addConfig(mockConfig, 'MOCK-CONFIG-ID');

            expect((sut as any).configs['MOCK-CONFIG-ID']).toBe(mockConfig);
        });

        it('should add config as shared id if is not present', () => {
            sut.addConfig(mockConfig);

            expect((sut as any).configs['shared']).toBe(mockConfig);
        });

    });

    describe('getConfig', () => {

        it('should return config by id', () => {
            sut.addConfig(mockConfig, 'CONFIG');

            expect(sut.getConfig('CONFIG')).toBe(mockConfig);
        });

        it('should return shared config by default', () => {
            sut.addConfig(mockConfig);

            expect(sut.getConfig()).toBe(mockConfig);
        });

        it('should create shared config if there is no configs', () => {
            expect(sut.getConfig()).toEqual(ngFilesConfigDefault);
        });

        it('should throw if there is no configs with passed id', () => {
            const spy = spyOn((NgFilesService as any), 'throwError');
            const expectedResultMsg = 'Config \'INVALID-ID\' is not found';

            sut.getConfig('INVALID-ID');

            expect(spy).toHaveBeenCalledWith(expectedResultMsg, 'reference');
        });

        describe('isUnique', () => {

            it('should throw if config added twice', () => {
                const spy = spyOn((NgFilesService as any), 'throwError');
                const expectedResultMsg = 'Avoid add the same config more than once';

                (sut as any).configs['MOCK-CONFIG-ID'] = mockConfig;
                sut.addConfig(mockConfig, 'MOCK-CONFIG-ID');

                expect(spy).toHaveBeenCalledWith(expectedResultMsg);
            });

        });

        describe('isFilesCountValid', () => {

            it('should throw if maxFilesCount less than 1', () => {
                const spy = spyOn((NgFilesService as any), 'throwError');
                const expectedResultMsg = 'maxFilesCount must be between 1 and Infinity';

                (sut as any).isFilesCountValid(<NgFilesConfig>{maxFilesCount: 0});

                expect(spy).toHaveBeenCalledWith(expectedResultMsg, 'range');
            });

            it('should return this', () => {
                const reulst = (sut as any).isFilesCountValid(<NgFilesConfig>{maxFilesCount: 1});

                expect(reulst).toBe(sut);
            });

        });

        describe('isAcceptExtensionsValid', () => {

            it('should throw if acceptExtensions is string and not equal "*"', () => {
                const spy = spyOn((NgFilesService as any), 'throwError');
                const expectedResultMsg = 'acceptanceExtensions type must be "*" or string[]';

                (sut as any).isAcceptExtensionsValid(<NgFilesConfig>{acceptExtensions: 'INVALID-SELECTOR'});

                expect(spy).toHaveBeenCalledWith(expectedResultMsg, 'syntax');
            });

            it('should return this', () => {
                const reulst = (sut as any).isAcceptExtensionsValid(<NgFilesConfig>{acceptExtensions: '*'});

                expect(reulst).toBe(sut);
            });

        });

        describe('isFileSizeRangesValid', () => {

            it('should throw if maxFileSize less than totalFilesSize', () => {
                const spy = spyOn((NgFilesService as any), 'throwError');
                const expectedResultMsg = 'maxFileSize must be less than totalFilesSize';

                (sut as any).isFileSizeRangesValid(<NgFilesConfig>{
                    maxFileSize: 2222,
                    totalFilesSize: 1111
                });

                expect(spy).toHaveBeenCalledWith(expectedResultMsg, 'range');
            });

            it('should return this', () => {
                const reulst = (sut as any).isAcceptExtensionsValid(<NgFilesConfig>{});

                expect(reulst).toBe(sut);
            });

        });

        describe('transformAcceptExtensions', () => {

            it('should map extensions from * to */*', () => {
                const mockPipeConfig = <NgFilesConfig>{acceptExtensions: '*'};

                (sut as any).transformAcceptExtensions(mockPipeConfig);

                expect(mockPipeConfig.acceptExtensions).toBe('*/*');
            });

            it('should map extensions to */* if * present in extensions array', () => {
                const mockPipeConfig = <NgFilesConfig>{acceptExtensions: ['exe', '*', 'com']};

                (sut as any).transformAcceptExtensions(mockPipeConfig);

                expect(mockPipeConfig.acceptExtensions).toBe('*/*');
            });

            it('should map extensions to */* if extensions array is empty', () => {
                const mockPipeConfig = <NgFilesConfig>{acceptExtensions: []};

                (sut as any).transformAcceptExtensions(mockPipeConfig);

                expect(mockPipeConfig.acceptExtensions).toBe('*/*');
            });

            it('should return this', () => {
                const reulst = (sut as any).transformAcceptExtensions(<NgFilesConfig>{acceptExtensions: '*'});

                expect(reulst).toBe(sut);
            });

        });

    });

});
