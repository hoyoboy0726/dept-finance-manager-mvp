
import { Component, ElementRef, Input, ViewChild, effect, input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { MonthlyReport } from '../../services/finance.service';

@Component({
  selector: 'app-d3-chart',
  standalone: true,
  template: `
    <div class="relative w-full h-full bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <h3 class="text-lg font-semibold text-gray-700 mb-4">{{ title() }}</h3>
      <div #chartContainer class="w-full h-[300px]"></div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None
})
export class D3ChartComponent {
  title = input.required<string>();
  data = input.required<MonthlyReport[]>();
  type = input.required<'profit' | 'revenue-expense' | 'per-capita'>();

  @ViewChild('chartContainer') private chartContainer!: ElementRef;

  constructor() {
    effect(() => {
      // Trigger redraw when data or type changes
      const d = this.data();
      const t = this.type();
      // Use setTimeout to ensure ViewChild is ready
      setTimeout(() => this.drawChart(d, t), 0);
    });
  }

  private drawChart(data: MonthlyReport[], type: string) {
    if (!this.chartContainer) return;
    
    const element = this.chartContainer.nativeElement;
    d3.select(element).selectAll('*').remove(); // Clear previous

    if (data.length === 0) {
      d3.select(element).append('div').text('暫無數據').attr('class', 'flex items-center justify-center h-full text-gray-400');
      return;
    }

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([0, width])
      .padding(0.2);

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-30)');

    if (type === 'profit') {
        this.drawProfitChart(svg, data, x, height, width);
    } else if (type === 'revenue-expense') {
        this.drawRevExpChart(svg, data, x, height, width);
    } else if (type === 'per-capita') {
        this.drawPerCapitaChart(svg, data, x, height, width);
    }
  }

  private drawProfitChart(svg: any, data: MonthlyReport[], x: any, height: number, width: number) {
    const y = d3.scaleLinear()
      .domain([
        Math.min(0, d3.min(data, d => d.profit) || 0),
        d3.max(data, d => d.profit) || 0
      ])
      .nice()
      .range([height, 0]);

    svg.append('g').call(d3.axisLeft(y));
    
    // Grid lines
    svg.append('g')
        .attr('class', 'grid')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-opacity', 0.1)
        .call(d3.axisLeft(y).tickSize(-width).tickFormat('' as any));

    svg.append('g')
      .append('line')
      .attr('y1', y(0))
      .attr('y2', y(0))
      .attr('x1', 0)
      .attr('x2', width)
      .attr('stroke', '#9ca3af')
      .attr('stroke-width', 1);

    svg.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d: MonthlyReport) => x(d.month)!)
      .attr('y', (d: MonthlyReport) => d.profit >= 0 ? y(d.profit) : y(0))
      .attr('width', x.bandwidth())
      .attr('height', (d: MonthlyReport) => Math.abs(y(d.profit) - y(0)))
      .attr('fill', (d: MonthlyReport) => d.profit >= 0 ? '#10b981' : '#ef4444');
  }

  private drawRevExpChart(svg: any, data: MonthlyReport[], x: any, height: number, width: number) {
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.revenue, d.totalCost)) || 0])
      .nice()
      .range([height, 0]);

    svg.append('g').call(d3.axisLeft(y));

    // Lines
    const lineRevenue = d3.line<MonthlyReport>()
      .x(d => x(d.month)! + x.bandwidth() / 2)
      .y(d => y(d.revenue));

    const lineCost = d3.line<MonthlyReport>()
      .x(d => x(d.month)! + x.bandwidth() / 2)
      .y(d => y(d.totalCost));

    // Revenue Line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', lineRevenue);

    // Cost Line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4')
      .attr('d', lineCost);
      
    // Legend
    this.addLegend(svg, width, ['收入', '總成本'], ['#3b82f6', '#ef4444']);
  }

  private drawPerCapitaChart(svg: any, data: MonthlyReport[], x: any, height: number, width: number) {
     const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.avgRevenue, d.avgCost)) || 0])
      .nice()
      .range([height, 0]);

    svg.append('g').call(d3.axisLeft(y));

    const lineAvgRev = d3.line<MonthlyReport>()
      .x(d => x(d.month)! + x.bandwidth() / 2)
      .y(d => y(d.avgRevenue));

    const lineAvgCost = d3.line<MonthlyReport>()
      .x(d => x(d.month)! + x.bandwidth() / 2)
      .y(d => y(d.avgCost));

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#8b5cf6')
      .attr('stroke-width', 2)
      .attr('d', lineAvgRev);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2)
      .attr('d', lineAvgCost);

     this.addLegend(svg, width, ['人均效益', '人均成本'], ['#8b5cf6', '#f59e0b']);
  }

  private addLegend(svg: any, width: number, labels: string[], colors: string[]) {
      const legend = svg.append('g')
        .attr('transform', `translate(${width - 150}, -15)`);
      
      labels.forEach((label, i) => {
          legend.append('rect')
            .attr('x', 0)
            .attr('y', i * 20)
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', colors[i]);
          
          legend.append('text')
            .attr('x', 15)
            .attr('y', i * 20 + 9)
            .text(label)
            .attr('font-size', '12px')
            .attr('fill', '#4b5563');
      });
  }
}
