var colorScheme1 = {
  'domain': [1, 10, 50, 200, 500, 1000, 2000, 4000],
  'range': d3.schemeOrRd[9],
}
var colorScheme2 = {
  'domain': [0, 0.2, 0.8, 2, 5, 10, 50],
  'range': d3.schemeBuGn[8],
}
var currColorScheme = colorScheme1;

var boundaries = true;

var colorButton = d3.select("body")
    .append("button")
    .text("Toggle Color Scheme")
    .on("click", function() {
        currColorScheme = (currColorScheme === colorScheme1) ?
          colorScheme2 : colorScheme1;
        createMap();
    });

var boundaryButton = d3.select("body")
    .append("button")
    .text("Toggle Boundaries")
    .on("click", function() {
        boundaries = !boundaries;
        createMap();
    });

var width = 960,
    height = 600;

var svg = d3.select("body")
  .append("div")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .attr("class", "hidden");
tooltip.append("div")
    .attr("id", "label");
tooltip.append("div")
    .attr("id", "desc");

function tooltipMove() {
  const x = d3.event.clientX + window.scrollX + 10;
  const y = d3.event.clientY + window.scrollY + 10;

  d3.select("#tooltip")
      .style("left", x + "px")
      .style("top", y + "px");
}

createMap();

function createMap() {
  svg.html(null);

  var rateById = d3.map();

  var color = d3.scaleThreshold()
      .domain(currColorScheme.domain)
      .range(currColorScheme.range);

  var projection = d3.geoAlbersUsa()
      .scale(3200)
      .translate([width*1.5, -height*0.4]);

  var path = d3.geoPath()
      .projection(projection);

  d3.queue()
      .defer(d3.json, "AK-02-alaska-counties.json")
      .defer(d3.csv, "popDensityByCounty.csv", function(d) {
        rateById.set(d['GCT_STUB.target-geo-id2'], +d['Density per square mile of land area']);
      })
      .await(ready);

  function ready(error, ak) {
    if (error) throw error;

    svg.append("g")
        .attr("class", "counties")
      .selectAll("path")
        .data(topojson.feature(ak, ak.objects['cb_2015_alaska_county_20m']).features)
      .enter().append("path")
        .attr("fill", function(d) { 
          return color(rateById.get(parseInt(d.properties.GEOID)));
        })
        .attr("d", path)
        .on("mouseover", function(d) {
          tooltip.select("#label")
            .text(d.properties.NAME);
          tooltip.select("#desc")
            .text("Population density: " + rateById.get(parseInt(d.properties.GEOID)))
            tooltip.classed("hidden", false);
        })
        .on("mousemove", function(d) {
          tooltipMove();
        })
        .on("mouseout", function() {tooltip.classed("hidden", true);});

    if (boundaries) {
      svg.append("path")
        .datum(topojson.mesh(ak, ak.objects['cb_2015_alaska_county_20m'], function(a, b) { return a !== b; }))
        .attr("class", "boundary")
        .attr("d", path);
    }
  }

  // Legend Scale
  var x = d3.scaleSqrt()
      .domain([0, currColorScheme.domain[currColorScheme.domain.length-1]*1.125])
      .rangeRound([440, 950]);

  var g = svg.append("g")
      .attr("class", "key")
      .attr("transform", "translate(0,40)");

  g.selectAll("rect")
    .data(color.range().map(function(d) {
        d = color.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
      }))
    .enter().append("rect")
      .attr("height", 8)
      .attr("x", function(d) { return x(d[0]); })
      .attr("width", function(d) { return x(d[1]) - x(d[0]); })
      .attr("fill", function(d) { return color(d[0]); });

  g.append("text")
      .attr("class", "caption")
      .attr("x", x.range()[0])
      .attr("y", -6)
      .attr("fill", "#000")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text("Population per square mile");

  g.call(d3.axisBottom(x)
      .tickSize(13)
      .tickValues(color.domain())
      .tickFormat(currColorScheme === colorScheme2 ? d3.format(".1f") : null))
    .select(".domain")
      .remove();
  //
}