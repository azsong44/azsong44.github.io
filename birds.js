// Variable Initializations
const geoJSONfile = "world-continents.json";
const datafile = "newbirddata.csv";
const githubLink = "https://petercai0131.github.io/CSE163_Birds/";

const width = 900;
const height = 900;
let state = -1;

const continentToName = {
  "NA": "North America",
  "SA": "South America",
  "EU": "Europe",
  "AF": "Africa",
  "AS": "Asia",
  "OC": "Oceania",
}
let birdList = [];
let rootName = "";
const options = [
  "", "color", "order", "family", "general_name",
  "habitat", "food", "nesting", "behavior", "conservation",
]
let sunburstOrder = ["family", "color"];
let singleBird = "";

// Creating divs
const root = d3.select("body").append("div")
  .attr("id", "root");
const titleDiv = root.append("div")
  .attr("id", "titleDiv");
const centerDiv = root.append("div")
  .attr("id", "centerDiv")
  .style("display", "flex")
  .style("justify-content", "space-evenly");
const leftDiv = centerDiv.append("div")
  .attr("id", "leftDiv");
const arrowDiv = centerDiv.append("div")
  .attr("id", "arrowDiv");
const mainDiv = centerDiv.append("div")
  .attr("id", "mainDiv")
  .attr("width", width)
  .attr("height", height)
  .style("display", "flex")
  .style("justify-content", "space-evenly")
  .style("align-items", "center");
const rightDiv = centerDiv.append("div")
  .attr("id", "rightDiv");
const creditsDiv = root.append("div")
  .attr("id", "creditsDiv");

// Data Parsing
const birdMap = new Map();
const propertyNames = ["image", "color", "scientific_name", "order", "family",
  "general_name", "habitat", "food", "nesting", "behavior", "conservation",
  "aab_description"];
const locationToBird = new Map(); // Location: [Bird1, Bird2, ...]
d3.csv(datafile, (d) => {
  // birdMap
  const properties = {};
  for (let i = 0; i < propertyNames.length; i++) {
    properties[propertyNames[i]] = d[propertyNames[i]];
  }
  birdMap.set(d["real_name"], properties);

  // locationToBird
  const locations = d["location"].split(",");
  for (let i = 0; i < locations.length; i++) {
    if (!locationToBird.get(locations[i])) {
      locationToBird.set(locations[i], []);
    }
    locationToBird.get(locations[i]).push(d["real_name"]);
  }
}).then(() => {
  title("Birds");
  arrowPanel();
  dropdownMenus();
  credits(githubLink);
  handleToGeomap();
});

// ____________________________________________________________________________
//
// HANDLE CLICKS
// ____________________________________________________________________________
function handleToSunburst(birdList, rootName, divID="mainDiv") {
  console.log('tosunburst')
  state = 1;
  d3.select(`#${divID}`).html(null);
  d3.selectAll(".geomapHidden").style("opacity", "1");
  drawSunburst(birdList, rootName, divID);
}

function handleToGeomap(divID="mainDiv") {
  console.log("to map")
  state = 0;
  d3.select(`#${divID}`).html(null);
  d3.selectAll(".geomapHidden").style("opacity", "0");
  geomap(divID);
}

function handleSingleBird(birdName=singleBird, divID="rightDiv") {
  d3.select(`#${divID}`).html(null);
  createBirdOverview(birdName, divID);
}

// ____________________________________________________________________________
//
// TITLE AND CREDITS
// ____________________________________________________________________________
function title(text="Title", divID="titleDiv") {
  d3.select(`#${divID}`).append("h1")
    .attr("class", "title")
    .text(text);
}

function credits(githubLink, divID="creditsDiv") {
  const center = d3.select(`#${divID}`).append("div");
  const row = d3.select(`#${divID}`).append("div")
    .style("margin-top", "10px")
    .style("display", "flex")
    .style("justify-content", "space-evenly");

  // Created by
  center.append("div")
    .attr("class", "subtitle")
    .text("Created By:");

  // List of group member names
  const members = [
    "Wen Liao (wliao9@ucsc.edu)",
    "Kayla Zhang (zzhan333@ucsc.edu)",
    "Yongmao Cai (yocai@ucsc.edu)",
    "Sheng Chen (schen272@ucsc.edu)",
    "Alanna Song (azsong@ucsc.edu)",
  ];
  center.append("div")
    .attr("class", "normal_text")
    .selectAll("span")
    .data(members)
    .enter()
    .append("span")
    .text(function(d) {return d;})
    .append("br");

  // Github Link
  center.append("div")
    .attr("class", "subtitle")
    .text("Github Link: ");
  center.append("div")
    .attr("class", "normal_text")
    .append("a")
      .text(githubLink)
      .attr("href", githubLink);
  
  // Designed for
  center.append("div")
    .attr("class", "subtitle")
    .text("Designed For: ");
  center.append("div")
    .attr("class", "normal_text")
    .text("CSE 163: Data Programming for Visualization, Fall 2022");

  // Files Submitted
  const filesSubmitted = row.append("div");
  filesSubmitted.append("div")
      .attr("class", "subtitle")
      .text("Files Submitted:");
  const files = ["index.html", "birds.js", "birds.css", geoJSONfile, datafile];
  filesSubmitted.append("div")
    .attr("class", "normal_text")
    .selectAll("span")
    .data(files)
    .enter()
    .append("span")
    .text(function(d) {return d;})
    .append("br");
  
  // Data Sources
  const dataSources = row.append("div");
  dataSources.append("div")
    .attr("class", "subtitle")
    .text("Data Sources:");
  const sources = [
    ["eBird", "https://ebird.org/home"],
    ["All About Birds", "https://www.allaboutbirds.org/"]
  ];
  dataSources.append("div")
    .attr("class", "normal_text")
    .selectAll("a")
    .data(sources)
    .enter()
    .append("a")
    .text(function(d) {return d[0];})
    .attr("href", function(d) {return d[1];})
    .append("br");

  // Relevant Visualizations
  const relevantVisualizations = row.append("div");
  relevantVisualizations.append("div")
    .attr("class", "subtitle")
    .text("Relevant Visualizations:");
  const visualizations = [
    ["Chinese History: Rise and Fall", "https://sureshlodha.github.io/CMPS263_Winter2018/CMPS263FinalProjects/ChineseHistory/index.html"],
    ["Endangered Species Spotlight", "https://sureshlodha.github.io/CMPS263_Winter2018/CMPS263FinalProjects/EndangeredSpecies/index.html"]
  ];
  relevantVisualizations.append("div")
    .attr("class", "normal_text")
    .selectAll("a")
    .data(visualizations)
    .enter()
    .append("a")
    .text(function(d) {return d[0];})
    .attr("href", function(d) {return d[1];})
    .append("br");

  // Code Sources
  const codeSources = row.append("div");
  codeSources.append("div")
    .attr("class", "subtitle")
    .text("Code Sources:");
  const codes = [
    ["Sunburst", "https://observablehq.com/@d3/sunburst"],
    ["Kavrayskiy VII projection", "https://bl.ocks.org/mbostock/3710082"]
  ];
  codeSources.append("div")
    .attr("class", "normal_text")
    .selectAll("a")
    .data(codes)
    .enter()
    .append("a")
    .text(function(d) {return d[0];})
    .attr("href", function(d) {return d[1];})
    .append("br");
}

// ____________________________________________________________________________
//
// LEFT AND RIGHT PANELS
// ____________________________________________________________________________
function dropdownMenus(order=sunburstOrder, propOptions=options, divID="leftDiv") {
  const main = d3.select(`#${divID}`)
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("justify-content", "center");
  
  main.append("div")
    .text("Sunburst Category Options:");

  const numOptions = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
  main.append("div")
    .attr("class", "dropdownMenus")
    .selectAll("div")
    .data(numOptions)
    .enter()
    .append("div")
    .append("select")
    .attr("id", function (d) {return `dropdown${d}`;})
    .attr("name", function (d) {return `dropdown${d}`;})
      .selectAll("option")
      .data(propOptions)
      .enter()
      .append("option")
      .attr("value", function (d) {return d;})
      .text(function (d) {return d;});

  main.append("button")
    .text("Set Options")
    .on("click", function() {
      const newOrder = [];
      for (let i = 0; i < 9; i++) {
        let val = d3.select(`#dropdown${i}`).node().value;
        if (val.length > 0 && !newOrder.includes(val)) {
          newOrder.push(val);
        }
      }
      console.log(newOrder);
      if (newOrder.length > 0) {
        sunburstOrder = newOrder;
      }
      if (state === 1) {
        handleToSunburst(birdList, rootName);
      }
    });
}

function arrowPanel(divID="arrowDiv") {
  d3.select(`#${divID}`)
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("justify-content", "space-around");
  const backButton = d3.select(`#${divID}`).append("div")
    .append("svg")
    .attr("class", "geomapHidden")
    .attr("width", "20")
    .attr("height", "20")
    .on("click", function() {handleToGeomap()});
  backButton.append("polygon")
    .attr("points", "0,10 20,0 20,20")
    .attr("fill", "#777777");
}

function createBirdOverview(birdName=singleBird, divID="rightDiv", width=300, datamap=birdMap) {
  birdProps = datamap.get(birdName);
  const main = d3.select(`#${divID}`)
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("justify-content", "flex-start");// "space-around");

  const headInfo = main.append("div");
  const birdTitle = headInfo.append("h3")
    .attr("class", "subtitle")
    .text(birdName);

  const birdImage = headInfo.append("img")
    .attr("src", birdProps.image)
    .attr("alt", birdName)
    .attr("width", width);
  
  const information = main.append("div")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("justify-content", "space-between")
    .style("margin-top", "10px");
  const leftInfo = information.append("div")
    .style("font-style", "italic");
  leftInfo.append("div")
    .text(`Scientific Name: ${birdProps.scientific_name}`);
  leftInfo.append("div")
    .text(`Order: ${birdProps.order}`);
  leftInfo.append("div")
    .text(`Family: ${birdProps.family}`);
  
  const table = main.append("div").append("table")
    .style("margin-top", "10px");
  const rowProps = ["Habitat", "Food", "Nesting", "Behavior", "Conservation"];
  for (rowProp of rowProps) {
    console.log(rowProp);
    const row = table.append("tr");
    row.append("td")
      .text(rowProp)
      .style("font-weight", "bold");
    row.append("td")
      .text(":");
    row.append("td")
      .text(birdProps[rowProp.toLowerCase()]);
  }
  // const description = main.append("div")
  //   .text(birdProps.aab_description)
  //   .style("word-wrap", "break-word")
  //   .attr("width", "100%");
}

// ____________________________________________________________________________
//
// SUNBURST
// ____________________________________________________________________________

function drawSunburst(list = birdList, root, divID="sunburstDiv") {
  if (list.length === 0) {return;}
  // sunburstDiv.html(null);
  const sunburstJSONdata = createSunburstJSON(list, root, sunburstOrder)
  Sunburst(sunburstJSONdata, {
    divID: divID,
    value: d => d.size, // size of each node (file); null for internal nodes (folders)
    label: d => d.name, // display name for each cell
    title: (d, n) => `${n.ancestors().reverse().map(d => d.data.name).join(".")}\n${n.value.toLocaleString("en")}`, // hover text
    width: 700,
    height: 700
  })
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/sunburst
function Sunburst(data, { // data is either tabular (array of objects) or hierarchy (nested objects)
  divID = "sunburstDiv",
  path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
  id = Array.isArray(data) ? d => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
  parentId = Array.isArray(data) ? d => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
  children, // if hierarchical data, given a d in data, returns its children
  value, // given a node d, returns a quantitative value (for area encoding; null for count)
  sort = (a, b) => d3.descending(a.value, b.value), // how to sort nodes prior to layout
  label, // given a node d, returns the name to display on the rectangle
  title, // given a node d, returns its hover text
  link, // given a node d, its link (if any)
  linkTarget = "_blank", // the target attribute for links (if any)
  width = 640, // outer width, in pixels
  height = 400, // outer height, in pixels
  margin = 1, // shorthand for margins
  marginTop = margin, // top margin, in pixels
  marginRight = margin, // right margin, in pixels
  marginBottom = margin, // bottom margin, in pixels
  marginLeft = margin, // left margin, in pixels
  padding = 1, // separation between arcs
  radius = Math.min(width - marginLeft - marginRight, height - marginTop - marginBottom) / 2, // outer radius
  color = d3.interpolateRainbow, // color scheme, if any
  fill = "#ccc", // fill for arcs (if no color encoding)
  fillOpacity = 0.6, // fill opacity for arcs
} = {}) {

  // If id and parentId options are specified, or the path option, use d3.stratify
  // to convert tabular data to a hierarchy; otherwise we assume that the data is
  // specified as an object {children} with nested objects (a.k.a. the “flare.json”
  // format), and use d3.hierarchy.
  const root = path != null ? d3.stratify().path(path)(data)
      : id != null || parentId != null ? d3.stratify().id(id).parentId(parentId)(data)
      : d3.hierarchy(data, children);

  // Compute the values of internal nodes by aggregating from the leaves.
  value == null ? root.count() : root.sum(d => Math.max(0, value(d)));

  // Sort the leaves (typically by descending value for a pleasing layout).
  if (sort != null) root.sort(sort);

  // Compute the partition layout. Note polar coordinates: x is angle and y is radius.
  d3.partition().size([2 * Math.PI, radius])(root);

  // Construct a color scale.
  if (color != null) {
    color = d3.scaleSequential([0, root.children.length - 1], color).unknown(fill);
    root.children.forEach((child, i) => child.index = i);
  }

  // Construct an arc generator.
  const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 2 * padding / radius))
      .padRadius(radius / 2)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1 - padding);

  const svg = d3.select(`#${divID}`).append("svg").raise()
      .attr("viewBox", [
        (marginRight - marginLeft - width / 2),
        marginBottom - marginTop - height / 2,
        width,
        height
      ])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("font-size", 12)
      .attr("text-anchor", "middle");

  const cell = svg
    .selectAll("a")
    .data(root.descendants())
    .join("a")
      .attr("xlink:href", link == null ? null : d => link(d.data, d))
      .attr("target", link == null ? null : linkTarget);

  cell.append("path")
      .attr("d", arc)
      .attr("fill", color ? d => color(d.ancestors().reverse()[1]?.index) : fill)
      .attr("fill-opacity", fillOpacity)
      .on("click", function(d, i) {
        if (!d.children) {
          singleBird = d.data.name;
          handleSingleBird(singleBird);
        }
      });
      //.each((d) => console.log(d));

  if (label != null) cell
    .filter(d => (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10)
    .append("text")
      .attr("transform", d => {
        if (!d.depth) return;
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      })
      .attr("dy", "0.32em")
      .text(d => label(d.data, d));

  if (title != null) cell.append("title")
      .text(d => title(d.data, d));

  return svg.node();
}

// ____________________________________________________________________________
//
// ARRAY -> SUNBURST JSON (HELPER FUNCTIONS)
// ____________________________________________________________________________

function createSunburstJSON(birdList, rootName, propertyOrder,
  datamap = birdMap) {
  const children = recurSunburstJSON(birdList, propertyOrder, datamap);
  const sunburstData = {"name": rootName, "children": children}
  return sunburstData;
}

function recurSunburstJSON(keyArr, propertyOrder, datamap = birdMap) {
  const children = [];
  const newPropertyOrder = JSON.parse(JSON.stringify(propertyOrder));
  const property = newPropertyOrder[0];
  newPropertyOrder.shift();
  const propertyMap = createMapForSunburst(keyArr, property, datamap);
  for (const [prop, propBirdList] of Object.entries(propertyMap)) {
    let subChildren = [];

    // If leaf nodes
    if (newPropertyOrder.length === 0) {
      for (bird of propBirdList) {
        subChildren.push({"name": bird, "size": 1})
      }
    } else {
      subChildren = recurSunburstJSON(propBirdList, newPropertyOrder, datamap);
    }

    children.push({"name": prop, "children": subChildren});
  }
  return children;
}

// Creates {value : [key(s)]} map
function createMapForSunburst(keyArr, valueName,
  datamap = birdMap) {
  let map = {};
  for (key of keyArr) {
    const value = datamap.get(key)[valueName];
    if (!map[value]) {
      map[value] = [];
    }
    map[value].push(key);
  }
  return map;
}

// ____________________________________________________________________________
//
// GEOMAP
// ____________________________________________________________________________

function geomap(
  divID = "geomapDiv",
  width = 900,
  height = 550,
  geoJSON = geoJSONfile,
) {

  // var color = d3.scaleOrdinal(d3.schemeCategory20);
  var color = d3.scaleThreshold()
  .domain([1, 500, 1000, 2000, 2500, 3000, 3500, 4000])
  .range(d3.schemeOrRd[9]);

  // var graticule = d3.geoGraticule();
  var svg = d3.select(`#${divID}`).append("svg").raise()
    .attr("viewBox", [
      0,
      0,
      width,
      height
    ])
    .attr("id", "geomap")
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    .attr("font-size", 12)
    .attr("text-anchor", "middle");

  // var g = svg.append("g");

  // https://bl.ocks.org/mbostock/3710082
  var projection = d3.geoKavrayskiy7()
    .scale(170)
    .translate([width / 2.1, height / 1.6])
    .precision(.1)
    .rotate([-11,0]);

  // Map
  var path = d3.geoPath().projection(projection);

  // ?
  svg.append("defs").append("path")
    .datum({type: "Sphere"})
    .attr("id", "sphere")
    .attr("d", path);

  // Outline
  // svg.append("use")
  //   .attr("class", "stroke")
  //   .attr("xlink:href", "#sphere");

  // Grid
  // svg.append("path")
  //   .datum(graticule)
  //   .attr("class", "graticule")
  //   .attr("d", path);

  mapLegend(svg, color);
    
  d3.json(geoJSON).then(function(world) {
    var continents = topojson.feature(world, world.objects.continent).features;
    
    // Tooltip
    var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)

    // Drawing continents
    svg.selectAll(".continent")
      .data(continents)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("title", function(d,i) { return d.properties.continent; })
      .style("fill", function(d,i) { return color(d.properties.number); })
      .on("click", function(d, i) {
        birdList = locationToBird.get(d.properties.continent);
        rootName = continentToName[d.properties.continent];
        tooltip.style("opacity", 0)
        handleToSunburst(birdList, rootName);
      })
      //Tooltip
      .on("mousemove", function(d) {
        tooltip.style("opacity", 1)
          .html("Continent: " + continentToName[d.properties.continent] +
                "<br>Spieces: " + d.properties.number)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY) + "px")
      })
      .on("mouseout", function(d) {
        tooltip.style("opacity", 0)
      });
    
    // Locations of centers of continents
    var centroids = continents.map(function (d){
      return projection(d3.geoCentroid(d))
    });

    // Writing continent names
    svg.selectAll(".name")
      .data(centroids)
      .enter()
      .append("text")
        .attr("x", function (d){ return d[0]; })
        .attr("y", function (d){ return d[1]; })
            .style("fill", "black")
        .attr("text-anchor", "middle")
        .text(function(d,i) {
          return continentToName[continents[i].properties.continent];
        });
  })
}

function mapLegend(mapSVG, color) {
  var x = d3.scaleSqrt()
    .domain([0, 4500])
    .rangeRound([440, 950]);
    
  var g = mapSVG.append("g")
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
      .text("Number of Species");

  g.call(d3.axisBottom(x)
      .tickSize(13)
      .tickValues(color.domain()))
    .select(".domain")
      .remove();
}
