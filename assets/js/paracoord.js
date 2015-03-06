/**
 * Parallel Coordinate Plot
 * Part of Visual Analytics 2015 Practical.
 * Candidate number: 589087
 *
 * ----- Acknowledgement -----
 * The code is adapted from Mike Bostock's Parallel Coordinate Plot, which can be found
 * at the D3.js's repository at https://github.com/mbostock/d3/wiki/Gallery. The code is modified
 * for Visual Analytics practical.
 * ---------------------------
 */

var m = [80, 160, 200, 160],
    w = 1280 - m[1] - m[3], // 960
    h = 850 - m[0] - m[2]; // 520

var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    foreground;

var svg = d3.select("#paracoord").append("svg:svg")
    .attr("width", w + m[1] + m[3]) // 1280
    .attr("height", h + m[0] + m[2]) // 800
    .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")"); // translate(160, 80)

d3.csv("assets/data/data5year.csv", function (words) {

    var names = [];
    // load names
    words.forEach(function (d, i) {
        names.push(d.names);
    });

    var axes = d3.keys(words[0]);

    var x = d3.scale.ordinal().domain(axes).rangePoints([0, w]),// [0, 960]
        y = {};

    // Create a scale and brush for each trait.
    axes.forEach(function (d) {

        if (d == "names")
            y[d] = d3.scale.ordinal().domain(names).rangeRoundPoints([h, 0]);
        else
            y[d] = d3.scale.linear().domain([0, 250]).range([h, 0]);

        y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush);
    });

    // Add a legend.
    var legend = svg.selectAll("g.legend")
        .data(names)
        .enter().append("svg:g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(" + 150 * Math.floor(i / 7) + "," + ((i % 7) * 20 + 584) + ")";
        });

    legend.append("svg:line")
        .attr("class", String)
        .attr("x2", 8);

    legend.append("svg:text")
        .attr("x", 12)
        .attr("dy", ".31em")
        .text(function (d) {
            return d;
        });

    // Add foreground lines.
    foreground = svg.append("svg:g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(words)
        .enter().append("svg:path")
        .attr("d", path)
        .attr("class", function (d) {
            if (d.names == "3d") return "three-d"
            else return d.names;
        });

    // Add a group element for each trait.
    var g = svg.selectAll(".trait")
        .data(axes)
        .enter().append("svg:g")
        .attr("class", "trait")
        .attr("transform", function (d) {
            return "translate(" + x(d) + ")";
        })
        .call(d3.behavior.drag()
            .origin(function (d) {
                return {x: x(d)};
            })
            .on("dragstart", dragstart)
            .on("drag", drag)
            .on("dragend", dragend));

    // Add an axis and title.
    g.append("svg:g")
        .attr("class", "axis")
        .each(function (d) {
            d3.select(this).call(axis.scale(y[d]));
        })
        .append("svg:text")
        .attr("text-anchor", "middle")
        .attr("y", -9)
        .text(String);

    // Add a brush for each axis.
    g.append("svg:g")
        .attr("class", "brush")
        .each(function (d) {
            d3.select(this).call(y[d].brush);
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    function dragstart(d) {
        i = axes.indexOf(d);
    }

    function drag(d) {
        x.range()[i] = d3.event.x;
        axes.sort(function (a, b) {
            return x(a) - x(b);
        });
        g.attr("transform", function (d) {
            return "translate(" + x(d) + ")";
        });
        foreground.attr("d", path);
    }

    function dragend(d) {
        x.domain(axes).rangePoints([0, w]);
        var t = d3.transition().duration(500);
        t.selectAll(".trait").attr("transform", function (d) {
            return "translate(" + x(d) + ")";
        });
        t.selectAll(".foreground path").attr("d", path);
    }

// Returns the path for a given data point.
    function path(d) {
        return line(axes.map(function (p) {
            return [x(p), y[p](d[p])];
        }));
    }

// Handles a brush event, toggling the display of foreground lines.
    function brush() {
        var actives = axes.filter(function (p) {
                return !y[p].brush.empty();
            }),
            extents = actives.map(function (p) {
                return y[p].brush.extent();
            });
        foreground.classed("fade", function (d, k) {

            return !actives.every(function (p, i) {
                if (p == "names") return extents[i][0] <= (40 - k) / 40 * h && (40 - k) / 40 * h <= extents[i][1];
                else return extents[i][0] <= d[p] && d[p] <= extents[i][1];
            });
        });
    }
});