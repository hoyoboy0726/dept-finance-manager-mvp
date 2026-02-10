
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/finance.service';
import { D3ChartComponent } from '../charts/d3-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, D3ChartComponent],
  template: `
    <div class="space-y-6">
      <!-- Top Metrics Cards (Latest Month) -->
      @if (latestReport(); as report) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div class="text-gray-500 text-sm">本月收入 ({{ report.month }})</div>
            <div class="text-2xl font-bold text-gray-800">{{ report.revenue | number }}</div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
            <div class="text-gray-500 text-sm">本月總開銷 ({{ report.month }})</div>
            <div class="text-2xl font-bold text-gray-800">{{ report.totalCost | number }}</div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-sm border-l-4" [class.border-green-500]="report.profit >= 0" [class.border-red-500]="report.profit < 0">
            <div class="text-gray-500 text-sm">本月盈虧 ({{ report.month }})</div>
            <div class="text-2xl font-bold" [class.text-green-600]="report.profit >= 0" [class.text-red-600]="report.profit < 0">
              {{ report.profit | number }}
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
            <div class="text-gray-500 text-sm">人均效益</div>
            <div class="text-2xl font-bold text-gray-800">{{ report.avgRevenue | number:'1.0-0' }}</div>
          </div>
        </div>
      }

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <app-d3-chart 
          title="月度盈虧趨勢" 
          [data]="financeService.reports()" 
          type="profit">
        </app-d3-chart>
        
        <app-d3-chart 
          title="收入與總成本趨勢" 
          [data]="financeService.reports()" 
          type="revenue-expense">
        </app-d3-chart>

        <app-d3-chart 
          class="lg:col-span-2"
          title="人均效益與人均成本分析" 
          [data]="financeService.reports()" 
          type="per-capita">
        </app-d3-chart>
      </div>

      <!-- Detailed Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mt-6">
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 class="text-lg font-semibold text-gray-700">月度詳細報表</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-gray-600">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th class="px-6 py-3">月份</th>
                <th class="px-6 py-3">收入</th>
                <th class="px-6 py-3">人力成本</th>
                <th class="px-6 py-3">其他開銷</th>
                <th class="px-6 py-3">總成本</th>
                <th class="px-6 py-3">盈虧</th>
                <th class="px-6 py-3">人數</th>
                <th class="px-6 py-3">人均效益</th>
              </tr>
            </thead>
            <tbody>
              @for (row of financeService.reports(); track row.id) {
                <tr class="bg-white border-b hover:bg-gray-50">
                  <td class="px-6 py-4 font-medium">{{ row.month }}</td>
                  <td class="px-6 py-4 text-blue-600">{{ row.revenue | number }}</td>
                  <td class="px-6 py-4">{{ row.laborCost | number }}</td>
                  <td class="px-6 py-4">{{ row.totalExpenses | number }}</td>
                  <td class="px-6 py-4 text-red-600">{{ row.totalCost | number }}</td>
                  <td class="px-6 py-4 font-bold" [class.text-green-600]="row.profit >= 0" [class.text-red-600]="row.profit < 0">
                    {{ row.profit | number }}
                  </td>
                  <td class="px-6 py-4">{{ row.headcount }}</td>
                  <td class="px-6 py-4 text-purple-600">{{ row.avgRevenue | number:'1.0-0' }}</td>
                </tr>
              }
              @if (financeService.reports().length === 0) {
                <tr>
                   <td colspan="8" class="px-6 py-8 text-center text-gray-400">尚無數據，請先新增月度紀錄。</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  financeService = inject(FinanceService);

  latestReport = this.financeService.reports.length > 0 
    ? () => this.financeService.reports()[this.financeService.reports().length - 1] 
    : () => null;
}
