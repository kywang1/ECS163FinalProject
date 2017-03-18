// hide the form if the browser doesn't do SVG,
// (then just let everything else fail)
if (!document.createElementNS) {
  document.getElementsByTagName("form")[0].style.display = "none";
}

// field definitions from:
// <http://www.census.gov/popest/data/national/totals/2011/files/NST-EST2011-alldata.pdf>
var percent = (function() {
      var fmt = d3.format(".2f");
      return function(n) { return fmt(n) + "%"; };
    })(),
    fields = [
      {name: "(no scale)", id: "none"},
      // {name: "Census Population", id: "censuspop", key: "CENSUS%dPOP", years: [2010]},
      // {name: "Estimate Base", id: "censuspop", key: "ESTIMATESBASE%d", years: [2010]},
      {name: "Growth Domestic Product (million USD)", id: "gpd", key: "GDP%d", format: "+,"},
      {name: "Int'l Migration", id: "intlmig", key: "RINTERNATIONALMIG%d",years: [2011,2012,2013,2014],format: "+,"},
      {name: "Domestic Migration", id: "domesticmig", key: "RDOMESTICMIG%d",years: [2011,2012,2013,2014], format: "+,"},
      {name: "Birth Rate", id: "birthrate", key: "RBIRTH%d",years: [2011,2012,2013,2014], format: percent},
      {name: "Death Rate", id: "deathrate", key: "RDEATH%d",years: [2011,2012,2013,2014], format: percent},
      {name: "Int'l Migration Rate", id: "intlmigrate", key: "RINTERNATIONALMIG%d", years: [2011,2012,2013,2014], format: percent},
      {name: "Net Domestic Migration Rate", id: "domesticmigrate", key: "RDOMESTICMIG%d", years: [2011,2012,2013,2014], format: percent},
      {name: "Percent Clean Enegry Consumption Per Capita", id: "cleanConsumptionCapita", key: "cleanEnergyConsumptionCapita",format: percent},
      {name: "Percent Unclean Enegry Consumption Per Capita", id: "uncleanConsumptionCapita", key: "uncleanEnergyConsumptionCapita",format: percent},
      {name: "Percent Clean Enegry Production Per Capita", id: "cleanProductionCapita", key: "cleanEnergyProductionCapita",format: percent},
      {name: "Percent Unclean Enegry Production Per Capita", id: "uncleanProductionCapita", key: "uncleanEnergyProductionCapita",format: percent},
      {name: "Energy Price Per Capita", id: "energyPrice", key: "energyPriceCapita"},
    ],
    years = [2010, 2011,2012,2013,2014],
    fieldsById = d3.nest()
      .key(function(d) { return d.id; })
      .rollup(function(d) { return d[0]; })
      .map(fields),
    field = fields[0],
    year = years[0],
    colors =["#ffe6e6","#ffb3b3","#ff8080","#ff4d4d","#ff1a1a","#e60000"];

var filter1 = false;
var filter2 = false;

var fields2 = [ //field name for second filter
      {name: "(no scale)", id: "none"},
      // {name: "Census Population", id: "censuspop", key: "CENSUS%dPOP", years: [2010]},
      // {name: "Estimate Base", id: "censuspop", key: "ESTIMATESBASE%d", years: [2010]},
      {name: "Growth Domestic Product (million USD)", id: "gpd", key: "GDP%d", format: "+,"},
      {name: "Int'l Migration", id: "intlmig", key: "RINTERNATIONALMIG%d",years: [2011,2012,2013,2014],format: "+,"},
      {name: "Domestic Migration", id: "domesticmig", key: "RDOMESTICMIG%d",years: [2011,2012,2013,2014], format: "+,"},
      {name: "Birth Rate", id: "birthrate", key: "RBIRTH%d",years: [2011,2012,2013,2014], format: percent},
      {name: "Death Rate", id: "deathrate", key: "RDEATH%d",years: [2011,2012,2013,2014], format: percent},
      {name: "Int'l Migration Rate", id: "intlmigrate", key: "RINTERNATIONALMIG%d", years: [2011,2012,2013,2014], format: percent},
      {name: "Net Domestic Migration Rate", id: "domesticmigrate", key: "RDOMESTICMIG%d", years: [2011,2012,2013,2014], format: percent},
      {name: "Percent Clean Enegry Consumption Per Capita", id: "cleanConsumptionCapita", key: "cleanEnergyConsumptionCapita",format: percent},
      {name: "Percent Unclean Enegry Consumption Per Capita", id: "uncleanConsumptionCapita", key: "uncleanEnergyConsumptionCapita",format: percent},
      {name: "Percent Clean Enegry Production Per Capita", id: "cleanProductionCapita", key: "cleanEnergyProductionCapita",format: percent},
      {name: "Percent Unclean Enegry Production Per Capita", id: "uncleanProductionCapita", key: "uncleanEnergyProductionCapita",format: percent},
      {name: "Energy Price Per Capita", id: "energyPrice", key: "energyPriceCapita"},
    ],
    field2 = fields2[0]

var body = d3.select("body"),
    stat = d3.select("#status");

var fieldSelect = d3.select("#field")
  .on("change", function(e) {
    filter1 = true;
    field = fields[this.selectedIndex];
    location.hash = "#" + [field.id, year].join("/");
  });

var fieldSelect2 = d3.select("#field2") // second filter field select
  .on("change",function(e){
    filter2 = true;
    field2 = fields2[this.selectedIndex];
    location.hash = "#" + [field2.id, year].join("/");
  });

fieldSelect2.selectAll("option") //second filter selectAll
  .data(fields2)
  .enter()
  .append("option")
    .attr("value", function(d) { return d.id; })
    .text(function(d) { return d.name; });

fieldSelect.selectAll("option")
  .data(fields)
  .enter()
  .append("option")
    .attr("value", function(d) { return d.id; })
    .text(function(d) { return d.name; });

var yearSelect = d3.select("#year")
  .on("change", function(e) {
    year = years[this.selectedIndex];
    location.hash = "#" + [field.id, year].join("/");
  });

yearSelect.selectAll("option")
  .data(years)
  .enter()
  .append("option")
    .attr("value", function(y) { return y; })
    .text(function(y) { return y; })

var map = d3.select("#map"),
    zoom = d3.behavior.zoom()
      .translate([-38, 32])
      .scale(.94)
      .scaleExtent([0.5, 10.0])
      .on("zoom", updateZoom),
    layer = map.append("g")
      .attr("id", "layer"),
    states = layer.append("g")
      .attr("id", "states")
      .selectAll("path");

// map.call(zoom);
updateZoom();

function updateZoom() {
  var scale = zoom.scale();
  layer.attr("transform",
    "translate(" + zoom.translate() + ") " +
    "scale(" + [scale, scale] + ")");
}

var proj = d3.geo.albersUsa(),
    topology,
    geometries,
    rawData,
    dataById = {},
    carto = d3.cartogram()
      .projection(proj)
      .properties(function(d) {
        return dataById[d.id];
      })
      .value(function(d) {
        return +d.properties[field];
      });

window.onhashchange = function() {
  parseHash();
};

var segmentized = location.search === "?segmentized",
    url = ["data",
      segmentized ? "us-states-segmentized.topojson" : "us-states.topojson"
    ].join("/");
d3.json(url, function(topo) {
  topology = topo;
  geometries = topology.objects.states.geometries;
  d3.csv("data/data.csv", function(data) {
    rawData = data;
    dataById = d3.nest()
      .key(function(d) {
        if(d.NAME == "Alaksa"){
          return "Alaska";
        }
        return d.NAME; })
      .rollup(function(d) { return d[0]; })
      .map(data);
    init();
  });
});

function init() {
  var features = carto.features(topology, geometries),
      path = d3.geo.path()
        .projection(proj);

  for (var key in dataById) {
      // skip loop if the property is from prototype
      if (!dataById.hasOwnProperty(key)) continue;

      var obj = dataById[key];
      for (var prop in obj) {
          // skip loop if the property is from prototype
          if(!obj.hasOwnProperty(prop)) continue;
          // Calculate Percent Clean/Unclean energy Consumption Per Capita
          obj.totalCleanConsumption = +(obj.GeoC2014)+(+(obj.HydroC2014))+(+(obj.NatGasC2014));
          obj.totalUncleanConsumption = +(obj.CoalC2014)+(+(obj.FossFuelC2014))+(+(obj.LPGC2014));
          obj.cleanEnergyConsumptionCapita= (obj.totalCleanConsumption/(+obj.POPESTIMATE2014))/ ((obj.totalUncleanConsumption/(+obj.POPESTIMATE2014)) + (obj.totalCleanConsumption/(+obj.POPESTIMATE2014)));
          obj.uncleanEnergyConsumptionCapita= (obj.totalUncleanConsumption/(+obj.POPESTIMATE2014))/ ((obj.totalUncleanConsumption/(+obj.POPESTIMATE2014)) + (obj.totalCleanConsumption/(+obj.POPESTIMATE2014)));

          //Calculate Percent Clean/Unclean energy production Per capita
          obj.totalCleanProduction = +(obj.GeoP2014)+(+(obj.HydroP2014));
          obj.totalUncleanProduction = +(obj.CoalP2014);
          obj.cleanEnergyProductionCapita= (obj.totalCleanProduction/(+obj.POPESTIMATE2014))/ ((obj.totalUncleanProduction/(+obj.POPESTIMATE2014)) + (obj.totalCleanProduction/(+obj.POPESTIMATE2014)));
          obj.uncleanEnergyProductionCapita= (obj.totalUncleanProduction/(+obj.POPESTIMATE2014))/ ((obj.totalUncleanProduction/(+obj.POPESTIMATE2014)) + (obj.totalCleanProduction/(+obj.POPESTIMATE2014)));

          //Energy Price Per Capita
          obj.energyPriceCapita = +(obj.TotalE2014*1000000)/(+obj.POPESTIMATE2014);

          obj.sameScale = 1;

          if(obj.totalCleanProduction == 0){
            obj.cleanEnergyProductionCapita = 0;
          }
          if(obj.totalUncleanProduction == 0){
            obj.uncleanEnergyProductionCapita = 0;
          }


      }
  }

  console.log(dataById);

  states = states.data(features)
    .enter()
    .append("path")
      .attr("class", "state")
      .attr("id", function(d) {
        return d.properties.NAME;
      })
      .attr("fill", "#fafafa")
      .attr("d", path);

  states.append("title");

  parseHash();
}

function reset() {
  stat.text("");
  body.classed("updating", false);

  var features = carto.features(topology, geometries),
      path = d3.geo.path()
        .projection(proj);

  states.data(features)
    .transition()
      .duration(750)
      .ease("linear")
      .attr("fill", "#fafafa")
      .attr("d", path);

  states.select("title")
    .text(function(d) {
      return d.properties.NAME;
    });
}

function update() {
  if(filter1 == true){
    var start = Date.now();
    body.classed("updating", true);

    var key = field.key.replace("%d", year),
        fmt = (typeof field.format === "function")
          ? field.format
          : d3.format(field.format || ","),
        value = function(d) {
          return +d.properties.uncleanEnergyProductionCapita;
        },
        value1 = function(d){
          return +d.properties[key];
        },
        values = states.data()
          .map(value)
          .filter(function(n) {
            return !isNaN(n);
          })
          .sort(d3.ascending),
        values1 = states.data()
          .map(value1)
          .filter(function(n) {
            return !isNaN(n);
          })
          .sort(d3.ascending),
        colorLo = values1[0],
        colorHi = values1[values1.length - 1]
        lo = values[0],
        hi = values[values.length - 1];

    var color = d3.scale.linear()
      .range(colors)
      .domain(lo < 0
        ? [colorLo, 0, colorHi]
        : [colorLo, d3.mean(values1), colorHi]);

    // normalize the scale to positive numbers
    var scale = d3.scale.linear()
      .domain([lo, hi])
      .range([1, 1000]);

    // tell the cartogram to use the scaled values

    carto.value(function(d) {
      return scale(value(d));
    });

    // generate the new features, pre-projected
    var features = carto(topology, geometries).features;

    // update the data
    states.data(features)
      .on("click",function(d){
        console.log( [d.properties.NAME, fmt(value1(d))].join(": "));
      })
      .select("title")
        .text(function(d) {
          return [d.properties.NAME, fmt(value1(d))].join(": ");
        });

    states.transition()
      .duration(750)
      .ease("linear")
      .attr("fill", function(d) { //update color
        return color(value1(d));
      })
      .attr("d", carto.path);

    var delta = (Date.now() - start) / 1000;
    stat.text(["calculated in", delta.toFixed(1), "seconds"].join(" "));
    body.classed("updating", false);

    filter1 = false;
  }

  if(filter2 == true){
    var start = Date.now();
    body.classed("updating", true);

    var key = field2.key.replace("%d", year),
        fmt = (typeof field2.format === "function")
          ? field2.format
          : d3.format(field2.format || ","),
        value = function(d) {
          return +d.properties[key];
        },
        values = states.data()
          .map(value)
          .filter(function(n) {
            return !isNaN(n);
          })
          .sort(d3.ascending),
        lo = values[0],
        hi = values[values.length - 1];

    var color = d3.scale.linear()
      .range(colors)
      .domain(lo < 0
        ? [lo, 0, hi]
        : [lo, d3.mean(values), hi]);

    // normalize the scale to positive numbers
    var scale = d3.scale.linear()
      .domain([lo, hi])
      .range([1, 1000]);

    // tell the cartogram to use the scaled values
    carto.value(function(d) {
      return scale(value(d));
    });

    // generate the new features, pre-projected
    var features = carto(topology, geometries).features;

    // update the data
    states.data(features)
      .on("click",function(d){
        console.log( [d.properties.NAME, fmt(value(d))].join(": "));
      })
      .select("title")
        .text(function(d) {
          return [d.properties.NAME, fmt(value(d))].join(": ");
        });

    states.transition()
      .duration(750)
      .ease("linear")
      .attr("d", carto.path);

    var delta = (Date.now() - start) / 1000;


    filter2 = false
  }
}

var deferredUpdate = (function() {
  var timeout;
  return function() {
    var args = arguments;
    clearTimeout(timeout);
    stat.text("calculating...");
    return timeout = setTimeout(function() {
      update.apply(null, arguments);
    }, 10);
  };
})();

var hashish = d3.selectAll("a.hashish")
  .datum(function() {
    return this.href;
  });

function parseHash() {
  console.log(filter1);
  if(filter1 == true){
    var parts = location.hash.substr(1).split("/"),
        desiredFieldId = parts[0],
        desiredYear = +parts[1];

    field = fieldsById[desiredFieldId] || fields[0];
    year = (years.indexOf(desiredYear) > -1) ? desiredYear : years[0];

    fieldSelect.property("selectedIndex", fields.indexOf(field));

    if (field.id === "none") {

      yearSelect.attr("disabled", "disabled");
      reset();

    } else {

      if (field.years) {
        if (field.years.indexOf(year) === -1) {
          year = field.years[0];
        }
        yearSelect.selectAll("option")
          .attr("disabled", function(y) {
            return (field.years.indexOf(y) === -1) ? "disabled" : null;
          });
      } else {
        yearSelect.selectAll("option")
          .attr("disabled", null);
      }

      yearSelect
        .property("selectedIndex", years.indexOf(year))
        .attr("disabled", null);

      deferredUpdate();
      location.replace("#" + [field.id, year].join("/"));

      hashish.attr("href", function(href) {
        return href + location.hash;
      });
    }
  }

  if(filter2 == true){
    var parts = location.hash.substr(1).split("/"),
        desiredFieldId = parts[0],
        desiredYear = +parts[1];

    field = fieldsById[desiredFieldId] || fields2[0];
    year = (years.indexOf(desiredYear) > -1) ? desiredYear : years[0];

    fieldSelect2.property("selectedIndex", fields2.indexOf(field));

    if (field2.id === "none") {

      yearSelect.attr("disabled", "disabled");
      reset();

    } else {

      if (field2.years) {
        if (field2.years.indexOf(year) === -1) {
          year = field2.years[0];
        }
        yearSelect.selectAll("option")
          .attr("disabled", function(y) {
            return (field2.years.indexOf(y) === -1) ? "disabled" : null;
          });
      } else {
        yearSelect.selectAll("option")
          .attr("disabled", null);
      }

      yearSelect
        .property("selectedIndex", years.indexOf(year))
        .attr("disabled", null);

      deferredUpdate();
      console.log(field2.id);
      location.replace("#" + [field2.id].join("/"));

      hashish.attr("href", function(href) {
        return href + location.hash;
      });
    }
  }

}
