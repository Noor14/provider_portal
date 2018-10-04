import { NgFilesClickComponent } from './ng-files-click.component';

describe('NgFilesClickComponent', () => {

    let sut: NgFilesClickComponent,
        mockChangeDetector,
        mockNgFilesService,
        mockNgFilesUtilsService;

    mockNgFilesService = {
        getConfig: jasmine.createSpy('getConfig').and.returnValue({
            maxFilesCount: 1111,
            acceptExtensions: 'MOCK-EXTENSIONS'
        })
    };

    mockChangeDetector = {
        detectChanges: jasmine.createSpy('detectChanges')
    };

    mockNgFilesUtilsService = {
        verifyFiles: jasmine.createSpy('verifyFiles')
            .and.returnValue('MOCK-VERIFIED-FILES-LIST')
    };

    beforeEach(() => {
        sut = new NgFilesClickComponent(
            mockChangeDetector,
            mockNgFilesService,
            mockNgFilesUtilsService
        );
    });

    describe('when created', () => {

        it('should set configId as "shared" by default', () => {
            expect(sut.configId).toBe('shared');
        });

    });

    describe('OnInit', () => {

        it('should get proper maxFilesCount from configId', () => {
             sut.ngOnInit();

             expect(sut.maxFilesCount).toBe(1111);
        });

        it('should get proper acceptExtensions from configId', () => {
            sut.ngOnInit();

            expect(sut.acceptExtensions).toBe('MOCK-EXTENSIONS');
        });

    });

    describe('OnCheck', () => {

        it('should emit change detection', () => {
           sut.ngDoCheck();

           expect(mockChangeDetector.detectChanges).toHaveBeenCalled();
        });

    });

    describe('onChange', () => {

        it('should emit attached and verified file(s)', () => {
            sut.filesSelect.emit = jasmine.createSpy('emit');

            sut.onChange(<any>['MOCK-FILE-1', 'MOCK-FILE-2']);

            expect(sut.filesSelect.emit).toHaveBeenCalledWith('MOCK-VERIFIED-FILES-LIST');
        });

    });

});
