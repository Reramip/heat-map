const DATASET_URL="https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
d3.json(DATASET_URL).then((data)=>{
  const w=1400;
  const h=750;
  const margin={
    top:80,
    bottom:50,
    left:100
  };

  const MONTHS=["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
  
  const baseTemperature=data.baseTemperature;
  const monthlyVariance=data.monthlyVariance;
  const years=monthlyVariance.map(item=>item.year);
  const months=monthlyVariance.map(item=>item.month);
  const variances=monthlyVariance.map(item=>item.variance);

  const xScale=d3.scaleLinear().domain([d3.min(years),d3.max(years)]).range([margin.left,w]);
  const yScale=d3.scaleLinear().domain([d3.min(months),d3.max(months)]).range([margin.top,h-margin.bottom]);
  const zScale=d3.scaleLinear().domain([d3.min(variances),d3.max(variances)]).range([1,0]);

  const svg=d3.select("body").append("svg").attr("width",w).attr("height",h);

  const rectWidth=(w-margin.left)*12/monthlyVariance.length;
  const rectHeight=(h-margin.top-margin.bottom)/11;


  svg.append("text")
    .text("Monthly Global Land-Surface Temperature")
    .style("font-size",20)
    .attr("x", w/2)
    .attr("y", 15)
    .attr("text-anchor", "middle");
  svg.append("text")
    .text(`${d3.min(years)} - ${d3.max(years)}: base temperature ${baseTemperature}℃`)
    .style("margin",0)
    .style("font-size",16)
    .attr("x", w/2)
    .attr("y", 35)
    .attr("text-anchor", "middle");


  const xAxis=d3.axisBottom(xScale)
                .tickFormat(d3.format(".0d"));
  svg.append("g")
      .attr("transform", `translate(0,${h-margin.bottom+rectHeight/2})`)
      .call(xAxis);
  const yAxis=d3.axisLeft(yScale)
                .tickFormat(m=>MONTHS[m-1]);
  svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);  


  const tips = d3.select("body").append("div").attr("id","tips").style("left","-10000px");
  tips.append("text").attr("id","year-month");
  tips.append("text").attr("id","temperature");
  tips.append("text").attr("id","variance");


  svg.selectAll("rect")
      .data(monthlyVariance)
      .enter()
      .append("rect")
      .attr("x",d=>xScale(d.year))
      .attr("y",d=>yScale(d.month)-rectHeight/2)
      .attr("fill",d=>d3.interpolateRdYlBu(zScale(d.variance)))
      .attr("width",rectWidth)
      .attr("height",rectHeight)
      .on("mouseover",d=>{
        tips.style("left",`${d3.event.pageX+10}px`);
        tips.style("top",`${d3.event.pageY-50}px`);
        d3.select("#year-month").text(`${d.year} - ${MONTHS[d.month-1]}`);
        d3.select("#temperature").text(`${(baseTemperature+d.variance).toFixed(2)}℃`);
        d3.select("#variance").text(`${d.variance.toFixed(2)}℃`);
      })
      .on("mouseout",()=>{
        tips.style("left","-10000px");
      });


  const labelMin=baseTemperature+d3.min(variances);
  const labelMax=baseTemperature+d3.max(variances);
  let labelArray=[];
  for(let i=0;i<10;++i){
    let item=labelMin+i*(labelMax-labelMin)/10;
    labelArray.push(item);
    svg.append("rect")
      .attr("x", w/2+250+25*i)
      .attr("y", 5)
      .attr("fill", d3.interpolateRdYlBu(zScale(item-baseTemperature)))
      .attr("width",25)
      .attr("height",25);
  }
  labelArray.push(labelMax);
  const labelScale=d3.scaleLinear().domain([labelMin,labelMax]).range([0,250]);
  const labelAxis=d3.axisBottom(labelScale)
                    .tickValues(labelArray)
                    .tickFormat(d=>d.toFixed(1));
  svg.append("g")
      .attr("transform", `translate(${w/2+250},30)`)
      .call(labelAxis);  
});
