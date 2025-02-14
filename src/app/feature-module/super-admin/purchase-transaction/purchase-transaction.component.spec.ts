import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseTransactionComponent } from './purchase-transaction.component';

describe('PurchaseTransactionComponent', () => {
  let component: PurchaseTransactionComponent;
  let fixture: ComponentFixture<PurchaseTransactionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PurchaseTransactionComponent]
    });
    fixture = TestBed.createComponent(PurchaseTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
