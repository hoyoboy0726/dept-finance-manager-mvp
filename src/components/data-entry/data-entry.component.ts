
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { FinanceService, MonthlyRecord } from '../../services/finance.service';

@Component({
  selector: 'app-data-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-800">新增月度營運數據</h2>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-6">
        
        <!-- Basic Info Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">月份</label>
            <input type="month" formControlName="month" 
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
            @if (form.get('month')?.invalid && form.get('month')?.touched) {
              <p class="text-red-500 text-xs">請選擇月份</p>
            }
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">現況人力數量 (人)</label>
            <input type="number" formControlName="headcount" min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">部門收入 ($)</label>
            <input type="number" formControlName="revenue" min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">總人力成本 ($)</label>
            <input type="number" formControlName="laborCost" min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
          </div>
        </div>

        <hr class="border-gray-100" />

        <!-- Expenses Section -->
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-800">各項開銷費用</h3>
            <button type="button" (click)="addExpense()" 
              class="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition flex items-center gap-1">
              <i class="fas fa-plus"></i> 新增項目
            </button>
          </div>

          <div formArrayName="expenses" class="space-y-3">
            @for (expense of expenses.controls; track $index) {
              <div [formGroupName]="$index" class="flex items-center gap-3">
                <div class="flex-1">
                  <select formControlName="category" class="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option value="人事費用">人事費用 (非薪資)</option>
                    <option value="營運費用">營運費用</option>
                    <option value="行銷費用">行銷費用</option>
                  </select>
                </div>
                <div class="flex-1">
                  <input type="number" formControlName="amount" placeholder="金額" min="0"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
                <button type="button" (click)="removeExpense($index)" class="text-red-400 hover:text-red-600 p-2">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            }
            @if (expenses.controls.length === 0) {
              <p class="text-gray-400 text-sm text-center py-4 bg-gray-50 rounded border border-dashed border-gray-300">
                尚無額外開銷項目，請點擊上方按鈕新增。
              </p>
            }
          </div>
        </div>

        <div class="pt-4 flex justify-end gap-3">
          <button type="button" (click)="resetForm()" 
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition">
            重置
          </button>
          <button type="submit" [disabled]="form.invalid"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed">
            儲存資料
          </button>
        </div>
      </form>
    </div>
  `
})
export class DataEntryComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private financeService = inject(FinanceService);

  form: FormGroup = this.fb.group({
    month: ['', Validators.required],
    revenue: [0, [Validators.required, Validators.min(0)]],
    laborCost: [0, [Validators.required, Validators.min(0)]],
    headcount: [1, [Validators.required, Validators.min(1)]],
    expenses: this.fb.array([])
  });

  successMessage = signal('');

  get expenses() {
    return this.form.get('expenses') as FormArray;
  }

  addExpense() {
    const expenseGroup = this.fb.group({
      category: ['營運費用', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]]
    });
    this.expenses.push(expenseGroup);
  }

  removeExpense(index: number) {
    this.expenses.removeAt(index);
  }

  resetForm() {
    this.form.reset({
      month: '',
      revenue: 0,
      laborCost: 0,
      headcount: 1
    });
    this.expenses.clear();
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const record: MonthlyRecord = {
        id: '', // Service generates ID
        month: formValue.month,
        revenue: formValue.revenue,
        laborCost: formValue.laborCost,
        headcount: formValue.headcount,
        expenses: formValue.expenses
      };

      this.financeService.saveRecord(record);
      alert('資料已成功儲存！');
      this.resetForm();
    }
  }
}
