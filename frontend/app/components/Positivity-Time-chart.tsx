import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { MemoType } from '../types/MemoType';

type ParsedMemoType = {
  id: string;
  time: Date;
  memo: string;
  sentimentScore: string;
  positivityScore: number;
};

type Props = {
  data: MemoType[];
};

const LineChart: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const parsedData: ParsedMemoType[] = data.map(d => ({
      ...d,
      time: d3.timeParse('%Y-%m-%dT%H:%M:%S.%LZ')(d.time) as Date,
      positivityScore: +d.positivityScore,
    }));

    const timeExtent = d3.extent(parsedData, d => d.time);
    const maxPositivityScore = d3.max(parsedData, d => d.positivityScore);

    if (timeExtent[0] && timeExtent[1] && maxPositivityScore !== undefined) {
      const xScale = d3.scaleTime()
        .domain(timeExtent as [Date, Date])
        .range([margin.left, width - margin.right]);

      const yScale = d3.scaleLinear()
        .domain([0, maxPositivityScore])
        .range([height - margin.bottom, margin.top]);

      // Create line generator
      const line = d3.line<ParsedMemoType>()
        .x(d => xScale(d.time))
        .y(d => yScale(d.positivityScore));

      // Select the SVG element
      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height);

      // Clear previous chart
      svg.selectAll('*').remove();

      // Add the line path
      svg.append('path')
        .datum(parsedData)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add the X Axis
      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

      // Add the Y Axis
      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));
    }
  }, [data]);

  return (
    <svg ref={svgRef}></svg>
  );
};

export default LineChart;

