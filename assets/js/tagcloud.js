/**
* Tag Cloud Plot.
* Part of Visual Analytics 2015 Practical.
* Candidate number: 589087
*
* ----- Acknowledgement -----
* The code is adapted from Jason Davies's Word Cloud, which can be found
* at the D3.js's repository at https://github.com/mbostock/d3/wiki/Gallery. The code is modified
* for Visual Analytics practical.
* ---------------------------
*/
d3.csv("assets/data/data5yearsum.csv", function(words){

    var total = 0, perc = [], data = [], colour = [];
    words.forEach(function(d, i){
        total += parseInt(d.sum);
        data.push(d.names);
        colour.push(d.colour);
    });

    words.forEach(function(d, i){
        perc.push(Math.log10(d.sum / total * 1000));
    });

    var fill = d3.scale.ordinal()
        .domain([0, 39])
        .range(colour);

    d3.layout.cloud().size([1280, 500])
        .words(data.map(function(d, i) {
            return {text: d, size: perc[i] * 30};
        }))
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .font("Impact")
        .fontSize(function(d) { return d.size; })
        .on("end", draw)
        .start();

    function draw(words) {
        d3.select("#tagcloud").append("svg")
            .attr("width", 1280)
            .attr("height", 500)
            .append("g")
            .attr("transform", "translate(640,250)")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("font-family", "Impact")
            .style("fill", function(d, i) { return fill(i); })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
    }
});
