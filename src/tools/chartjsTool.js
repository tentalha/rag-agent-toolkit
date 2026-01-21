import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * Mock Chart.js Tool
 * Generates a Chart.js configuration based on input data
 */
export class ChartJsTool extends DynamicStructuredTool {
  constructor() {
    super({
      name: 'chartjs_generator',
      description: 'Generates a Chart.js configuration for creating charts. Use this when the user asks to create, generate, or visualize data as a chart, graph, or plot.',
      schema: z.object({
        chartType: z.enum(['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea']).describe('The type of chart to generate'),
        labels: z.array(z.string()).describe('The labels for the chart data points'),
        data: z.array(z.number()).describe('The numerical data values for the chart'),
        title: z.string().optional().describe('Optional title for the chart'),
      }),
      func: async ({ chartType, labels, data, title }) => {
        return generateChartConfig(chartType, labels, data, title);
      },
    });
  }
}

/**
 * Generate a Chart.js configuration
 */
function generateChartConfig(chartType, labels, data, title) {
  const config = {
    type: chartType,
    data: {
      labels: labels,
      datasets: [
        {
          label: title || 'Dataset',
          data: data,
          backgroundColor: generateColors(data.length, 0.6),
          borderColor: generateColors(data.length, 1),
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        title: {
          display: !!title,
          text: title || '',
        },
      },
    },
  };

  // Add specific options based on chart type
  if (chartType === 'bar' || chartType === 'line') {
    config.options.scales = {
      y: {
        beginAtZero: true,
      },
    };
  }

  return JSON.stringify(config, null, 2);
}

/**
 * Generate colors for chart datasets
 */
function generateColors(count, opacity) {
  const baseColors = [
    `rgba(255, 99, 132, ${opacity})`,  // Red
    `rgba(54, 162, 235, ${opacity})`,  // Blue
    `rgba(255, 206, 86, ${opacity})`,  // Yellow
    `rgba(75, 192, 192, ${opacity})`,  // Green
    `rgba(153, 102, 255, ${opacity})`, // Purple
    `rgba(255, 159, 64, ${opacity})`,  // Orange
  ];

  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
}

/**
 * Create an instance of the Chart.js tool
 */
export function createChartJsTool() {
  return new ChartJsTool();
}
