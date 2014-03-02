(function() {

    var height = 720,
		width = 900;
		margin = 20;

	// color 
	var layerOneBackgroundColor = d3.rgb(200,200,200),
		republicanColor = "red",
		democraticColor = "blue",
		noMatchColor = "grey"
		rectBound = "black",
		layerTwoBackgroundColor = d3.rgb(200,200,200)
		highlight = "white";

	// data in json format		
	var republicData = [],
		democratData = [],
		noMatchData = [];

	// first layer variables
	var rectSize_1 = 10,
		firstLayerWidth = width / 5,
		firstLayerHeight = 2 * height / 3
		numRects = Math.floor(firstLayerWidth / rectSize_1),
		startHeight = margin,
		heightSoFar = 0
		fontSize = 50;

	// second layer variables
	var secondLayerWidth = width / 10,
		secondLayerHeight = height,
		rectSize_2 = secondLayerWidth * 0.9,
		boundary = secondLayerWidth * 0.1;

 	d3.select("body").insert("svg:svg")
		   	.attr("width", width)
	    	.attr("height", height);
	  		
	var svg = d3.select("svg")
				.append("g");

	var sec = d3.select("svg")
				.append("g")
				.attr("id", "secondG");

	// Logic of the first layer
	function firstLayer(){
		 // Load the data
		d3.json("./data/layer1.json",
				function(d) {
					var data = d.map(function(d) {
						if (d.party == 100){
							// republican
							republicData.push({secId:d.secId, matchNum:d.matchingBills,date: d.minDate});
						} else if (d.party == 200) {
							democratData.push({secId:d.secId, matchNum:d.matchingBills,date: d.minDate});
						} else {
							noMatchData.push({secId:d.secId, matchNum:d.matchingBills,date: d.minDate});
						}
					});
					// start drawing the visualization
		 			start();
				});

		function start(){
			sortData();
			//initVar(data);
			drawRect();
			//drawLegend();
			//bindData(data);
		}

		function sortData(){
			republicData.sort(function(a, b) {
				// greater matchNum first 
				var diff = a["matchNum"] > b["matchNum"] ? -1 : ((a["matchNum"] < b["matchNum"]) ? 1 : 0);
				// TODO date?
				if (diff == 0){
					// smaller secId first
					diff = a["secId"] > b["secId"] ? 1 : ((a["secId"] < b["secId"]) ? -1 : 0);
				}
				return diff;
			});

			democratData.sort(function(a, b) {
				var diff = a["matchNum"] > b["matchNum"] ? -1 : ((a["matchNum"] < b["matchNum"]) ? 1 : 0);
				if (diff == 0){
					diff = a["secId"] > b["secId"] ? 1 : ((a["secId"] < b["secId"]) ? -1 : 0);
				}
				return diff;
			});
			// we don't care about the no match data for now
			// noMatchData.sort(function(a, b) {
			// 	var diff = a["matchNum"].localeCompare(b["matchNum"]);
			// 	if (diff == 0){
			// 		diff = a["secId"].localeCompare(b["secId"]);
			// 	}
			// 	return diff;
			// });
		}

		function drawRect(){

			svg.selectAll("republican")
				.data(republicData)
				.enter()
				.append("rect")
				.attr("id", function(d, i) { return "republicId" + i; })
				.attr("class", "republician")
				.attr("width", rectSize_1)
				.attr("height", rectSize_1)
				.attr("x", function(d, i) { return margin + (i*rectSize_1 %firstLayerWidth); })
				.attr("y", function(d, i) { heightSoFar = startHeight + Math.floor(i/numRects) *rectSize_1; return heightSoFar; })
				.attr("fill", republicanColor)
				.attr("stroke", rectBound)
				.on("click", toRepublicanSecLayer);

			heightSoFar += rectSize_1;
			startHeight = heightSoFar;

			svg.selectAll("democrat")
				.data(democratData)
				.enter()
				.append("rect")
				.attr("id", function(d, i) { return "democratId" + i; })
				.attr("class", "democrat")
				.attr("width", rectSize_1)
				.attr("height", rectSize_1)
				.attr("x", function(d, i) { return margin + (i*rectSize_1 %firstLayerWidth); })
				.attr("y", function(d, i) { heightSoFar = startHeight + Math.floor(i/numRects) *rectSize_1; return heightSoFar;})
				.attr("fill", democraticColor)
				.attr("stroke", rectBound)
				.on("click", toDemocratSecLayer);

			heightSoFar += rectSize_1;

			svg.selectAll("noMatch")
				.data(noMatchData)
				.enter()
				.append("rect")
				.attr("id", function(d, i) { return "noMatchId" + i; })
				.attr("class", "noMatch")
				.attr("width", rectSize_1)
				.attr("height", rectSize_1)
				.attr("x", function(d, i) { return margin + (i*rectSize_1 %firstLayerWidth); })
				.attr("y", function(d, i) { return heightSoFar + Math.floor(i/numRects) *rectSize_1; })
				.attr("fill", noMatchColor)
				.attr("stroke", rectBound);
		}


		function toRepublicanSecLayer(d, i){
			// clean up data
			sec.selectAll(".secondLayer").remove();
			sec.selectAll(".textGroup").remove();			
			secondLayer(republicData, "R");
		}

		function toDemocratSecLayer(d, i){
			sec.selectAll(".secondLayer").remove();
			sec.selectAll(".textGroup").remove();			
			secondLayer(democratData, "D");
		}
	}
	
	function secondLayer(data, party){
		var color,
			Id,
			totalHeight = 0;

		if (party === "R"){
			color = republicanColor;
			Id = "#republicId";
		} else {
			color = democraticColor;
			Id = "#democratId";
		}
		// console.log("second layer");
		
		var scroll = d3.behavior.zoom()
    		.on("zoom", scrolled);

    	sec.append("g:rect")
    		.attr("id", "secondbackground")
    		.attr("x", boundary + 2*margin + firstLayerWidth)
    		.attr("y", 0)
    		.attr("width", rectSize_2)
    		.attr("height", height)
    		.attr("fill", "white")
    		.style("opacity", 0)
    		.call(scroll);

		sec.selectAll("secondLayer")
				.data(data)
				.enter()
				.append("g:rect")
				.attr("id", function(d, i) { return "rect2Id" + i; })
				.attr("class", "secondLayer")
				.attr("width", 1)
				.attr("height", 1)
				.attr("x", function(d, i) { return margin + (i*rectSize_1 %firstLayerWidth); })
				.attr("y", function(d, i) { return margin + Math.floor(i/numRects) *rectSize_1; })
				.attr("fill", republicanColor)
				.attr("stroke", rectBound)
				.style("opacity", 0)
				.on("mouseover", showTip)
				.on("mouseleave", hideTip)
				.on("click", toThirdLayer)
				.call(scroll)
				.transition()
				.duration(1000)
				.attr("width", rectSize_2)
				.attr("height", rectSize_2)
				.attr("x", function(d, i) { return boundary + 2*margin + firstLayerWidth; })
				.attr("y", function(d, i) { totalHeight = margin + i*(rectSize_2+margin); return totalHeight;})
				.attr("fill", color)
				.attr("stroke", rectBound)
				.style("opacity", 1);

		totalHeight += rectSize_2;
		
		sec.selectAll("textGroup")
			.data(data)
			.enter()
			.append("g:text")
			.attr("id", function(d, i) { return "textId" + i; })
			.attr("class", "textGroup")
			.attr("x", function(d, i) { return margin + (i*rectSize_1 %firstLayerWidth); })
			.attr("y", function(d, i) { return margin + Math.floor(i/numRects) *rectSize_1; })
			.text(function(d) { return d.matchNum;})
			.attr("font-size", 5)
			.attr("text-anchor", "middle")
			.style("opacity", 0)
			.on("mouseover", showTip)
			.on("mouseleave", hideTip)
			.call(scroll)
			.transition()
			.duration(1000)
			.attr("x", function(d, i) { return (rectSize_2/2) + boundary + 2*margin + firstLayerWidth; })
			.attr("y", function(d, i) { return margin + (i)*(rectSize_2+margin) + 2*rectSize_2/3; })
			.attr("font-size", fontSize)
			.style("opacity", 1);

    		// formula: (height/2)x - (height/2) = y (y = totalHeight-hight)
    		scroll.scaleExtent([1, (2*totalHeight/height)-1])
    			.center([(rectSize_2/2) + boundary + 2*margin + firstLayerWidth, height/2]);
    		
		function scrolled(){
			
			//console.log(d3.event.translate[1]);
			
			sec.selectAll(".secondLayer")
				.attr("transform", "translate(0," + d3.event.translate[1] + ")");

			sec.selectAll(".textGroup")
				.attr("transform", "translate(0," + d3.event.translate[1] + ")");
		}

		function showTip(d, i){
			svg.select(Id+i)
				.attr("fill", highlight);
			sec.select("#rect2Id"+i)
				.attr("fill", highlight);
		}

		function hideTip(d, i){
			svg.select(Id+i)
				.attr("fill", color);
			sec.select("#rect2Id"+i)
				.attr("fill", color);
		}
		
		function toThirdLayer(){
			// TODO
		}
	}


	firstLayer();
})();