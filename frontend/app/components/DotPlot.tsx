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

const DotPlot: React.FC<Props> = ({ data }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    const margin = { top: 60, right: 20, bottom: 60, left: 50 };
    const totalWidth = 800;
    const totalHeight = 500;
    const width = totalWidth - margin.left - margin.right;
    const height = totalHeight - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', totalWidth)
      .attr('height', totalHeight)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

      const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => new Date(d.time)) as [Date, Date])
    .range([0, width]);

  // Format the x-axis to show only dates
  const xAxis = d3.axisBottom(xScale)
    .ticks(d3.timeDay.every(1))
    .tickFormat(d3.timeFormat('%Y-%m-%d') as any);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => +d.positivityScore) || 0])
      .range([height, 0]);

    svg.selectAll('circle')
      .data(data)
      .enter().append('circle')
      .attr('cx', d => xScale(new Date(d.time)))
      .attr('cy', d => yScale(+d.positivityScore))
      .attr('r', 4)
      .attr('fill', 'lightgreen');

      svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis as any)


    svg.append('g')
      .call(d3.axisLeft(yScale));

    svg.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 20})`)
      .style('text-anchor', 'middle')
      .attr("fill", "#F5F5DC")
      .text('Time');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .attr("fill", "#F5F5DC")
      .text('Positivity Score');

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 0 - margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .attr("fill", "#F5F5DC")
      .text('Memo Positivity Score Over Time');

  }, [data]);

  return (
    <svg ref={svgRef}></svg>
  );
};

export default DotPlot;
