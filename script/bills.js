(function() {

	// frame variables
    var height = 720,
		width = 900;
		margin = 20
		titleHight = 50;

	// color 
	var layerOneBackgroundColor = d3.rgb(200,200,200),
		republicanColor = "red",
		democraticColor = "blue",
		noMatchColor = "grey"
		rectBound = "black",
		layerTwoBackgroundColor = d3.rgb(200,200,200)
		highlight = "white",
		layerThreeBackgroundColor = d3.rgb(200,200,200);

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
		heightSoFar = 0,
		smallFont = 0,
		fontSize = 50;

	// second layer variables
	var secondLayerWidth = width / 10,
		secondLayerHeight = height,
		rectSize_2 = secondLayerWidth * 0.9,
		boundary = secondLayerWidth * 0.1;

	// third layer variables
	var thirdLayerWidth = 3*width / 5,
		thirdLayerHeight = height / 3 + 40,
		alignChartWidth = thirdLayerWidth - 50,
		alignChartHeight = height / 3,
		alignChartPadding = 10;

	// transition time
	var transTime = 1000;

 	d3.select("body").insert("svg:svg")
		   	.attr("width", width)
	    	.attr("height", height);
	  
	// clip the rect on the second layer so that rects won't go too high
	var clip = d3.select("svg").append("defs:clipPath")
					.attr("id", "clip")
					.append("rect")
					.attr("x", boundary + 2*margin + firstLayerWidth)
					.attr("y", margin)
					.attr("width", rectSize_2)
					.attr("height", height);

	var title = d3.select("svg").append("g")
					.append("text")
					.attr("id", "visTitle")
					.attr("x", margin)
					.attr("y", 2*margin)
					.text("How a bill becomes a law")
					.attr("font-size", fontSize);

	var svg = d3.select("svg")
				.append("g")
				.attr("id", "firstLayout")
				.attr("transform", "translate(0," + titleHight + ")");

	var sec = d3.select("svg")
				.append("g")
				.attr("id", "secondLayout")
				.attr("clip-path", "url(#clip)")
				.attr("transform", "translate(0," + titleHight + ")");
	
	var comp = d3.select("svg")
				.append("g")
				.attr("id", "thirdLayout")
				.attr("transform", "translate(" + (firstLayerWidth + secondLayerWidth + 50) + "," + titleHight + ")");

	var textDiv = d3.select("body")
					.append("div")
					.style({
						"position": "absolute", 
						"top": titleHight + thirdLayerHeight, 
						"left": firstLayerWidth + secondLayerWidth + 50,
						"height": height - thirdLayerHeight,
						"width": thirdLayerHeight});
	
	d3.select("svg")
		.style({
			"position": "absolute", 
			"top": 10, 
			"left": 10});

	// Logic of the first layer
	function firstLayer(){
		 // Load the data
		d3.json("./data/layer1.json",
				function(d) {
					var data = d.map(function(d) {
						if (d.party == 100){
							// republican
							republicData.push({secID:d.secID, matchNum:d.matchingBills,date: new Date(d.minDate*1000)});
						} else if (d.party == 200) {
							democratData.push({secID:d.secID, matchNum:d.matchingBills,date: new Date(d.minDate*1000)});
						} else {
							noMatchData.push({secID:d.secID, matchNum:d.matchingBills,date: new Date(d.minDate*1000)});
						}
					});
					// start drawing the visualization
		 			start();
				});

		function start(){
			sortData(republicData);
			sortData(democratData);
			// we don't care about the no match data for now
			drawRect_1();
		}

		// sort data by match number and than by section id
		function sortData(array){
			array.sort(function(a, b) {
				// greater matchNum first 
				var diff = a["matchNum"] > b["matchNum"] ? -1 : ((a["matchNum"] < b["matchNum"]) ? 1 : 0);
				// TODO date?
				if (diff == 0){
					// smaller secId first
					diff = a["secID"] > b["secID"] ? 1 : ((a["secID"] < b["secID"]) ? -1 : 0);
				}
				return diff;
			});
		}

		function drawRect_1(){

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
			secondLayer(republicData, "R");
		}

		function toDemocratSecLayer(d, i){				
			secondLayer(democratData, "D");
		}
	}
	
	function secondLayer(data, party){
		// clean up data first
		sec.selectAll(".rectSecond").remove();
		sec.selectAll(".textGroup").remove();	
		sec.select("#secondbackground").remove();	

		var color,
			Id,
			totalHeight = 0
			visableHeight = height - titleHight;

		if (party === "R"){
			color = republicanColor;
			Id = "#republicId";
		} else {
			color = democraticColor;
			Id = "#democratId";
		}
		
		var scroll = d3.behavior.zoom()
    					.on("zoom", scrolled);

    	function drawRect_2(){
    		var xPos = boundary + 2*margin + firstLayerWidth + rectSize_2/2;
	    	// background rect for the second layer
	    	sec.append("g:rect")
	    		.attr("id", "secondbackground")
	    		.attr("x", boundary + 2*margin + firstLayerWidth)
	    		.attr("y", margin)
	    		.attr("width", rectSize_2)
	    		.attr("height", visableHeight)
	    		.attr("fill", "white")
	    		.style("opacity", 0)
	    		.call(scroll)
	    		.on("dblclick.zoom", null);

			sec.selectAll("rectSecond")
				.data(data)
				.enter()
				.append("g:rect")
				.attr("id", function(d, i) { return "rect2Id" + i; })
				.attr("class", "rectSecond")
				.attr("width", 1)
				.attr("height", 1)
				// .attr("x", function(d, i) { return margin + (i*rectSize_1 %firstLayerWidth); })
				// .attr("y", function(d, i) { return startHeight + Math.floor(i/numRects) *rectSize_1; })
				.attr("x", xPos)
				.attr("y", function(d, i) { return rectSize_2/2 + margin + i*(rectSize_2+margin); })
				.attr("fill", republicanColor)
				.attr("stroke", rectBound)
				.style("opacity", 0.1)
				.on("click", toThirdLayer)
				.on("mouseover", showTip)
				.on("mouseleave", hideTip)
				.call(scroll)
				.on("dblclick.zoom", null)
				.transition()
				.duration(transTime)
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
				// .attr("x", function(d, i) { return margin + (i*rectSize_1 %firstLayerWidth); })
				// .attr("y", function(d, i) { return startHeight + Math.floor(i/numRects) *rectSize_1; })
				.attr("x", xPos)
				.attr("y", function(d, i) { return margin + (i)*(rectSize_2+margin) + rectSize_2/2; })
				.text(function(d) { return d.matchNum;})
				.attr("font-size", smallFont)
				.attr("text-anchor", "middle")
				.style("opacity", 0.1)
				.on("click", toThirdLayer)
				.on("mouseover", showTip)
				.on("mouseleave", hideTip)
				.call(scroll)
				.on("dblclick.zoom", null)
				.transition()
				.duration(transTime)
				.attr("x", function(d, i) { return (rectSize_2/2) + boundary + 2*margin + firstLayerWidth; })
				.attr("y", function(d, i) { return margin + (i)*(rectSize_2+margin) + 2*rectSize_2/3; })
				.attr("font-size", fontSize)
				.style("opacity", 1);	

    		// formula: (height/2)x - (height/2) = y (y = totalHeight-hight)
    		scroll.scaleExtent([1, (2*totalHeight/visableHeight)-1])
    			.center([(rectSize_2/2) + boundary + 2*margin + firstLayerWidth, visableHeight/2]);
    	}

		function scrolled(){
			// console.log(d3.event.translate[1]);
			sec.selectAll(".rectSecond")
				.attr("transform", "translate(0," + d3.event.translate[1] + ")");

			sec.selectAll(".textGroup")
				.attr("transform", "translate(0," + d3.event.translate[1] + ")");
		}

		function showTip(d, i){
			svg.select(Id+i)
				.attr("fill", highlight);
			sec.select("#rect2Id"+i)
				.attr("fill", highlight);
			//console.log(d.date);
		}

		function hideTip(d, i){
			svg.select(Id+i)
				.attr("fill", color);
			sec.select("#rect2Id"+i)
				.attr("fill", color);
		}
		
		function toThirdLayer(d){
			console.log("sec id: " + d.secID);
			thirdLayer(d.secID);
			
				
		}

		drawRect_2();
	}

	function thirdLayer(secID){
		comp.select("#alignChart").remove();
		textDiv.select("pre").remove();
		
		$.getJSON( "data/data.php", { section: secID} )
			.done(function( data ) {
				console.log(data);
				drawAlignChart(data);
				textDiv.append("pre")
					.style("width", thirdLayerWidth)
					.style({"position": "absolute", "top": titleHight + thirdLayerHeight + "px", "left": firstLayerWidth + secondLayerWidth + 50 + "px"})
					.html("<span style='background-color: red'>if this is highlighted, this method works</span>" + data.sectionText)
			});
		
		//still need to add axis labels
		function drawAlignChart(data) {
			var lengthScale = d3.scale.linear()
				.domain([0, data.sectionText.length])
				.range([0, alignChartHeight]);
			
			var timeScale = d3.scale.linear()
				.domain([1230940800, 1294012800])
				.range([0, alignChartWidth]);
			
			var minStart = data.sectionText.length;
			var maxEnd = -1;
			for (var i = 0; i < data.matches.length; i++) {
				minStart = Math.min(data.matches[i].docAstart, minStart);
				maxEnd = Math.max(data.matches[i].docAend, maxEnd);
			}
			minStart = Math.max(minStart - 10, 0);
			maxEnd = Math.min(maxEnd + 10, data.sectionText.length);
			
			var adjustedLengthScale = d3.scale.linear()
				.domain([minStart, maxEnd])
				.range([0, alignChartHeight]);
			
			var chart = comp.append("g")
				.attr("id", "alignChart")
				.attr("transform", "translate(" + alignChartPadding + "," + alignChartPadding + ")");
			
			chart.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("height", alignChartHeight)
				.attr("width", 2)
				.attr("fill", "black");
			
			chart.append("rect")
				//.attr("d", "M0," + alignChartHeight + " L" + alignChartHeight + "," + alignChartHeight)
				.attr("x", 0)
				.attr("y", alignChartHeight)
				.attr("height", 2)
				.attr("width", alignChartWidth)
				.attr("fill", "black");
		
			var markWidth = 4;
		
			chart.selectAll("alignments")
				.data(data.matches)
				.enter()
					.append("rect")
					.attr("class", "alignments")
					//.attr("d", function(d) { return "M" + (timeScale(d.IntrDate) + alignChartPadding) + "," + (alignChartPadding + alignChartHeight - lengthScale(parseInt(d.docAend))) + "L" + (timeScale(d.IntrDate) + alignChartPadding) + "," + (alignChartPadding + alignChartHeight - lengthScale(parseInt(d.docAstart)))})
					//.attr("stroke-width", 4)
					.attr("x", function(d) { return timeScale(d.IntrDate) - markWidth/2 + 4; })
					.attr("y", function(d) { return alignChartHeight - lengthScale(parseInt(d.docAend)); })
					.attr("height", function(d) { return lengthScale(parseInt(d.docAend)) - lengthScale(parseInt(d.docAstart));})
					.attr("width", markWidth)
					.attr("stroke", "black")
					.attr("stroke-width", 0)
					.attr("opacity", .5)
					.attr("fill", function(d) { if (d.Party == 100) { return democraticColor; } else { return republicanColor; }})
					.on("mouseover", function(d,i) { 
						d3.select(this)
							.attr("stroke-width", 2)
							.attr("fill", "yellow");
					})
					.on("mouseout", function(d,i) { 
						d3.select(this)
							.attr("stroke-width", 0)
							.attr("fill", function() { if (d.Party == 100) { return democraticColor; } else { return republicanColor; }});
					})
					.on("click", function(d,i) { 
						console.log("here is where the function to highlight text should be called");
					})
					.transition()
						.delay(2*transTime)
						.duration(transTime)
						//.attr("stroke-width", 2*markWidth)
						//.attr("d", function(d) { return "M" + (timeScale(d.IntrDate) + alignChartPadding) + "," + (alignChartPadding + alignChartHeight - adjustedLengthScale(parseInt(d.docAend))) + "L" + (timeScale(d.IntrDate) + alignChartPadding) + "," + (alignChartPadding + alignChartHeight - adjustedLengthScale(parseInt(d.docAstart)))})
						.attr("y", function(d) { return alignChartHeight - adjustedLengthScale(parseInt(d.docAend)); })
						.attr("height", function(d) { return adjustedLengthScale(parseInt(d.docAend)) - adjustedLengthScale(parseInt(d.docAstart));})
						.attr("width", 2*markWidth)
			
			var textHeight = 12;
			
			//If the min range is above zero, show dotted line
			if (minStart > 0) {
				chart.append("path")
					.attr("d", "M0," + (alignChartHeight - lengthScale(minStart)) + " L" + alignChartWidth + "," + (alignChartHeight - lengthScale(minStart)))
					.attr("stroke-width", 1)
					.attr("stroke", "black")
					.attr("stroke-dasharray", "10,10")
					.transition()
						.delay(2*transTime)
						.duration(transTime)
						.attr("d", "M0," + (alignChartHeight - adjustedLengthScale(minStart)) + " L" + alignChartWidth + "," + (alignChartHeight - adjustedLengthScale(minStart)));
						
				chart.append("text")
					.attr("x", alignChartWidth + 5)
					.attr("y", alignChartHeight - lengthScale(minStart) + textHeight/2)
					.text(Math.round(minStart/data.sectionText.length * 100) + "%")
					.transition()
						.delay(2*transTime)
						.duration(transTime)
						.attr("y", alignChartHeight - adjustedLengthScale(minStart) + textHeight/2);
			}
			
			if (maxEnd < data.sectionText.length) {
				chart.append("path")
					.attr("d", "M0," + (alignChartHeight - lengthScale(maxEnd)) + " L" + alignChartWidth + "," + (alignChartHeight - lengthScale(maxEnd)))
					.attr("stroke-width", 2)
					.attr("stroke", "black")
					.attr("stroke-dasharray", "10,10")
					.transition()
						.delay(2*transTime)
						.duration(transTime)
						.attr("d", "M0," + (alignChartHeight - adjustedLengthScale(maxEnd)) + " L" + alignChartWidth + "," + (alignChartHeight - adjustedLengthScale(maxEnd)));
						
				chart.append("text")
					.attr("x", alignChartWidth + 5)
					.attr("y", alignChartHeight - lengthScale(maxEnd) + textHeight/2)
					.text(Math.round(maxEnd/data.sectionText.length * 100) + "%")
					.transition()
						.delay(2*transTime)
						.duration(transTime)
						.attr("y", alignChartHeight - adjustedLengthScale(maxEnd) + textHeight/2);
			}
			
		}
	}


	firstLayer();
})();