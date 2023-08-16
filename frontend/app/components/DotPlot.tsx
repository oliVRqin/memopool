import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { MemoType } from '../types/MemoType';
  
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

    const timeExtent = d3.extent(data, d => new Date(d.time)) as [Date, Date];
      // 5 hour padding on each side to make the dots look nicer
      const padding = 5 * 60 * 60 * 1000;
      const paddedTimeExtent: [Date, Date] = [
          new Date(timeExtent[0].getTime() - padding),
          new Date(timeExtent[1].getTime() + padding)
      ];
        
    const xScale = d3.scaleTime()
        .domain(paddedTimeExtent)
        .range([0, width]);

    // Format the x-axis to show only dates
    const xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeDay.every(1))
      .tickFormat(d3.timeFormat('%Y-%m-%d') as any);
    
    const yScale = d3.scaleLinear()
      .domain([0, 10])
      .range([height, 0]);

    // SVG of a dot
    svg.selectAll('circle')
      .data(data)
      .enter().append('circle')
      .attr("class","dot")
      .attr('cx', d => xScale(new Date(d.time)))
      .attr('cy', d => yScale(+d.positivityScore))
      .attr('r', 5)
      .attr('fill', 'lightgreen')

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis as any)

    svg.append('g')
      .call(d3.axisLeft(yScale));

    svg.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 20})`)
      .style('text-anchor', 'middle')
      .attr("fill", "#F5F5DC")
      .text('Time (Days)');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .attr("fill", "#F5F5DC")
      .text('Positivity Score (1 to 10)');

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
