import * as d3 from 'd3';
import { View } from '../../types/ViewInterface';
import { ScoreObject } from '../../modules/ScoreObject';

export type ScoreGraphLines = {
  score: ScoreObject;
  color: string;
};

export class GraphsView implements View {
  public document: Document;

  constructor(document: Document) {
    this.document = document;
  }

  appendScoreGraph(el: HTMLElement, lines: ScoreGraphLines[]): void {
    const dataPoints = lines.map(line => [...line.score.history, line.score.value]);
    const maxValueX = (d3.max(dataPoints.map(line => line.length)) as number) ?? 0;
    const maxValueY = (d3.max(dataPoints.map(line => d3.max(line) as number)) as number) ?? 0;

    const minWidth = 320;
    const maxWidth = 800;
    const height = 100;
    const margin = 20;

    const graphId = 'scoreGraph';
    let graphWrapper: HTMLDivElement | null;

    graphWrapper = el.querySelector<HTMLDivElement>(`#${graphId}`);

    if (graphWrapper) {
      el.removeChild(graphWrapper);
    }

    graphWrapper = this.document.createElement('div');
    graphWrapper.id = graphId;

    el.appendChild(graphWrapper);

    // Reference the parent container
    const parent = d3
      .select(`#${graphId}`)
      .style('width', '100%')
      .style('max-width', `${maxWidth}px`)
      .style('min-width', `${minWidth}px`)
      .style('margin', '0 auto');

    const svg = parent
      .append('svg')
      .attr('viewBox', `0 0 ${maxWidth} ${height + margin * 2}`)
      .style('width', '100%') // Fully responsive
      .style('height', `${height + margin}px`); // Adjust height automatically

    const width = maxWidth - margin * 2;

    const g = svg.append('g').attr('transform', `translate(${margin}, ${margin})`);

    // Define scales
    const xScale = d3
      .scaleLinear()
      .domain([0, maxValueX]) // Index of the array
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, maxValueY]) // Value of the array items
      .range([height, 0]);

    // Draw lines
    lines.forEach((line, index) => {
      const d3Line = d3
        .line<number>()
        .x((_, i) => xScale(i))
        .y(d => yScale(d));

      g.append('path')
        .datum(dataPoints[index])
        .attr('fill', 'none')
        .attr('stroke', line.color)
        .attr('stroke-width', 2)
        .attr('d', d3Line);
    });

    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).ticks(0))
      .attr('color', '#fff')
      .attr('font-size', '10px');

    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('color', '#fff')
      .attr('font-size', '10px')
      .selectAll('.tick line')
      .remove();
  }

  appendHistogram(el: HTMLElement, allScores: number[], score: number): void {
    const minWidth = 320;
    const maxWidth = 800;
    const aspectRatio = 2; // Width-to-height ratio
    const margin = { top: 20, right: 20, bottom: 40, left: 20 };
    const numBins = 5;
    const graphId = 'histogram';

    let graphWrapper: HTMLDivElement | null;

    graphWrapper = el.querySelector<HTMLDivElement>(`#${graphId}`);

    if (graphWrapper) {
      el.removeChild(graphWrapper);
    }

    if (allScores.length === 0) {
      return;
    }

    graphWrapper = this.document.createElement('div');
    graphWrapper.id = graphId;
    graphWrapper.className = 'histogram';

    el.appendChild(graphWrapper);

    // Reference the parent container
    const parent = d3
      .select(`#${graphId}`)
      .style('width', '100%') // Full width within the parent
      .style('max-width', `${maxWidth}px`)
      .style('min-width', `${minWidth}px`)
      .style('margin', '0 auto'); // Center on larger screens

    const svg = parent
      .append('svg')
      .attr('viewBox', `0 0 ${maxWidth} ${maxWidth / aspectRatio}`)
      .attr('preserveAspectRatio', 'xMidYMid meet') // Maintain aspect ratio
      .style('width', '100%') // Fully responsive
      .style('height', 'auto'); // Adjust height automatically

    const width = maxWidth - margin.left - margin.right;
    const height = maxWidth / aspectRatio - margin.top - margin.bottom;

    const data = allScores;

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3
      .scaleLinear()
      .domain([d3.min([...data, score]) as number, d3.max([...data, score]) as number])
      .range([0, width])
      .clamp(true);

    const histogram = d3
      .bin()
      .domain(x.domain() as [number, number]) // Set the domain of the histogram
      .thresholds(x.ticks(numBins)); // Number of bins

    const bins = histogram(data);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, d => d.length) ?? 0]) // Set y scale domain
      .range([height, 0]);

    // Add bars
    g.selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('x', d => x(d.x0 ?? 0))
      .attr('y', d => y(d.length ?? 0))
      .attr('width', d => {
        const barWidth = x(d.x1 ?? 0) - x(d.x0 ?? 0) - 1;
        return Math.max(barWidth, 0); // Ensure non-negative width
      })
      .attr('height', d => height - y(d.length ?? 0))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .attr('color', '#fff')
      .attr('font-size', '10px');

    // Add y-axis
    g.append('g').call(d3.axisLeft(y)).attr('color', '#fff').attr('font-size', '10px');

    // Draw a yellow line for the given score
    if (score > 0) {
      g.append('line')
        .attr('x1', x(score)) // Position at the score on the x-axis
        .attr('x2', x(score))
        .attr('y1', 0) // Start at the top of the graph
        .attr('y2', height) // End at the bottom of the graph
        .attr('stroke', '#ffbb00')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4 2'); // Dashed for better visibility
    }
  }
}
