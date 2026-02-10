
import { Injectable, signal, computed } from '@angular/core';

export interface Expense {
  category: '人事費用' | '營運費用' | '行銷費用';
  amount: number;
}

export interface MonthlyRecord {
  id: string;
  month: string; // Format: YYYY-MM
  revenue: number;
  laborCost: number;
  headcount: number;
  expenses: Expense[];
}

// Derived interface for reporting
export interface MonthlyReport extends MonthlyRecord {
  totalExpenses: number;
  totalCost: number; // laborCost + totalExpenses
  profit: number; // revenue - totalCost
  avgRevenue: number; // revenue / headcount
  avgCost: number; // totalCost / headcount
}

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  // Initial mock data for demonstration
  private initialData: MonthlyRecord[] = [
    {
      id: '1', month: '2023-08', revenue: 1200000, laborCost: 600000, headcount: 10,
      expenses: [{ category: '營運費用', amount: 50000 }, { category: '行銷費用', amount: 30000 }]
    },
    {
      id: '2', month: '2023-09', revenue: 1350000, laborCost: 620000, headcount: 11,
      expenses: [{ category: '營運費用', amount: 55000 }, { category: '行銷費用', amount: 40000 }]
    },
    {
      id: '3', month: '2023-10', revenue: 1100000, laborCost: 620000, headcount: 11,
      expenses: [{ category: '營運費用', amount: 50000 }, { category: '行銷費用', amount: 20000 }]
    },
    {
      id: '4', month: '2023-11', revenue: 1500000, laborCost: 650000, headcount: 12,
      expenses: [{ category: '營運費用', amount: 60000 }, { category: '行銷費用', amount: 80000 }]
    },
    {
      id: '5', month: '2023-12', revenue: 1800000, laborCost: 650000, headcount: 12,
      expenses: [{ category: '營運費用', amount: 70000 }, { category: '行銷費用', amount: 100000 }]
    },
    {
      id: '6', month: '2024-01', revenue: 1400000, laborCost: 680000, headcount: 13,
      expenses: [{ category: '營運費用', amount: 55000 }, { category: '行銷費用', amount: 40000 }]
    }
  ];

  // State
  private recordsSignal = signal<MonthlyRecord[]>(this.initialData);

  // Computed: Processed reports sorted by date
  reports = computed(() => {
    const rawRecords = this.recordsSignal();
    return rawRecords
      .map(record => {
        const totalExpenses = record.expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalCost = record.laborCost + totalExpenses;
        const profit = record.revenue - totalCost;
        const avgRevenue = record.headcount > 0 ? record.revenue / record.headcount : 0;
        const avgCost = record.headcount > 0 ? totalCost / record.headcount : 0;

        return {
          ...record,
          totalExpenses,
          totalCost,
          profit,
          avgRevenue,
          avgCost
        } as MonthlyReport;
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  });

  // Action: Add or Update Record
  saveRecord(record: MonthlyRecord) {
    this.recordsSignal.update(currentRecords => {
      const existingIndex = currentRecords.findIndex(r => r.month === record.month);
      if (existingIndex >= 0) {
        // Update existing
        const updated = [...currentRecords];
        updated[existingIndex] = { ...record, id: currentRecords[existingIndex].id };
        return updated;
      } else {
        // Add new
        return [...currentRecords, { ...record, id: crypto.randomUUID() }];
      }
    });
  }

  // Action: Delete Record
  deleteRecord(id: string) {
    this.recordsSignal.update(records => records.filter(r => r.id !== id));
  }

  getRecordByMonth(month: string): MonthlyRecord | undefined {
    return this.recordsSignal().find(r => r.month === month);
  }
}
