import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage/storage.service';
import { IntroPage } from './intro.page';
import { SwiperModule } from 'swiper/angular';

describe('IntroPage', () => {
  let component: IntroPage;
  let fixture: ComponentFixture<IntroPage>;
  let mockRouter: any;
  let mockStorageService: any;

  beforeEach(waitForAsync(() => {
    mockRouter = {
      navigateByUrl: jasmine.createSpy('navigateByUrl')
    };

    mockStorageService = {
      getStorage: jasmine.createSpy('getStorage').and.returnValue(Promise.resolve({ value: 'false' })),
      setStorage: jasmine.createSpy('setStorage').and.returnValue(Promise.resolve())
    };

    TestBed.configureTestingModule({
      declarations: [IntroPage],
      imports: [SwiperModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: StorageService, useValue: mockStorageService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with the default swiper options', () => {
    expect(component.slideOpts).toEqual({});
  });

  it('should call setStorage and navigate to /auth-screen when goToLogin is called', async () => {
    await component.goToLogin();
    expect(mockStorageService.setStorage).toHaveBeenCalledWith('introSeen', 'true');
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/auth-screen', { replaceUrl: true });
  });

  it('should call setStorage and navigate to /tabs/home when goToHome is called', async () => {
    await component.goToHome();
    expect(mockStorageService.setStorage).toHaveBeenCalledWith('introSeen', 'true');
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/tabs/home', { replaceUrl: true });
  });

  it('should set introkey to false when introduction has not been seen', async () => {
    mockStorageService.getStorage.and.returnValue(Promise.resolve({ value: 'false' }));
    await component.ngOnInit();
    expect(component.introkey).toBeFalse();
  });

  it('should navigate to home if introduction has already been seen', async () => {
    mockStorageService.getStorage.and.returnValue(Promise.resolve({ value: 'true' }));
    await component.ngOnInit();
    expect(component.introkey).toBeTrue();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/tabs/home', { replaceUrl: true });
  });
});
