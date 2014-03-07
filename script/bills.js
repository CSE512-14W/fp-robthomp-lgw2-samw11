(function() {

	// frame variables
    var height = 720,
		width = 900;
		margin = 20
		titleHight = 70
		bodyMargin = 6;

	// color 
	var layerOneBackgroundColor = d3.rgb(200,200,200),
		republicanColor = "red",
		democraticColor = "blue",
		independentColor = "green",
		noMatchColor = "grey",
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
		startHeight = 0,
		heightSoFar = 0,
		smallFont = 0,
		fontSize = 50;

	// second layer variables
	var secondLayerWidth = width / 10,
		secondLayerHeight = height,
		rectSize_2 = secondLayerWidth * 0.9,
		boundary = secondLayerWidth * 0.1;
		xPos = 0;

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

	var sec = d3.select("body")
					.append("div")
					.attr("id", "secLayerDiv")
					.style({
						"position": "absolute", 
						"top": (titleHight + bodyMargin) + "px", 
						"left": (boundary + 2*margin + firstLayerWidth) + "px",
						"height": height + "px",
						"width": (secondLayerWidth + margin) + "px",
						"overflow": "scroll"})
					.append("svg:svg")
					.attr("width", secondLayerWidth);

	var comp = d3.select("svg")
				.append("g")
				.attr("id", "thirdLayout")
				.attr("transform", "translate(" + (firstLayerWidth + secondLayerWidth + 50) + "," + titleHight + ")");

	var textDiv = d3.select("body")
					.append("div")
					.style({
						"position": "absolute", 
						"top": (titleHight + thirdLayerHeight) + "px", 
						"left": (firstLayerWidth + secondLayerWidth + 50) + "px",
						"height": (height - thirdLayerHeight) + "px",
						"width": thirdLayerHeight + "px",
						"overflow": "scroll"});
	
	//TODO do we need this?
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
					var data = d["sections"].map(function(d) {
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
		 			controlFlow_1();
				});

		function controlFlow_1(){
			sortData(republicData);
			sortData(democratData);
			// we don't care about the no match data for now
			drawRect_1();
			// direct to second layer
			toRepublicanSecLayer();
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

		function controlFlow_2(){
			// cleanup first
			cleanSecondLayer();
			cleanThirdLayer();
			drawRect_2();
			//console.log(totalHeight);
			sec.attr("height", totalHeight);
			scrollUp();
			toThirdLayer(data[0]);
		}

    	function drawRect_2(){

			sec.append("g").selectAll("rectSecond")
				.data(data)
				.enter()
				.append("g:rect")
				.attr("id", function(d, i) { return "rect2Id" + i; })
				.attr("class", "rectSecond")
				.attr("width", 1)
				.attr("height", 1)
				// .attr("x", function(d, i) { return margin + (i*rectSize_1 %firstLayerWidth); })
				// .attr("y", function(d, i) { return startHeight + Math.floor(i/numRects) *rectSize_1; })
				.attr("x", rectSize_2/2)
				.attr("y", function(d, i) { return rectSize_2/2 + i*(rectSize_2+margin); })
				.attr("fill", republicanColor)
				.attr("stroke", rectBound)
				.style("opacity", 0.1)
				.on("click", toThirdLayer)
				.on("mouseover", showTip)
				.on("mouseleave", hideTip)
				// .call(scroll)
				// .on("dblclick.zoom", null)
				.transition()
				.duration(transTime)
				.attr("width", rectSize_2)
				.attr("height", rectSize_2)
				.attr("x", xPos)//function(d, i) { return boundary + 2*margin + firstLayerWidth; })
				.attr("y", function(d, i) { totalHeight = i*(rectSize_2+margin); return totalHeight;})
				.attr("fill", color)
				.attr("stroke", rectBound)
				.style("opacity", 1);

			totalHeight += rectSize_2;
			
			sec.append("g").selectAll("textGroup")
				.data(data)
				.enter()
				.append("g:text")
				.attr("id", function(d, i) { return "textId" + i; })
				.attr("class", "textGroup")
				// .attr("x", function(d, i) { return margin + (i*rectSize_1 %firstLayerWidth); })
				// .attr("y", function(d, i) { return startHeight + Math.floor(i/numRects) *rectSize_1; })
				.attr("x", rectSize_2/2)
				.attr("y", function(d, i) { return (i)*(rectSize_2+margin) + rectSize_2/2; })
				.text(function(d) { return d.matchNum;})
				.attr("font-size", smallFont)
				.attr("text-anchor", "middle")
				.style("opacity", 0.1)
				.on("click", toThirdLayer)
				.on("mouseover", showTip)
				.on("mouseleave", hideTip)
				// .call(scroll)
				// .on("dblclick.zoom", null)
				.transition()
				.duration(transTime)
				.attr("x", rectSize_2/2)//function(d, i) { return (rectSize_2/2) + boundary + 2*margin + firstLayerWidth; })
				.attr("y", function(d, i) { return (i)*(rectSize_2+margin) + 2*rectSize_2/3; })
				.attr("font-size", fontSize)
				.style("opacity", 1);	


    	}

    	function scrollUp(){
    		var container = document.getElementById("secLayerDiv");
    		var rowToScrollTo = document.getElementById("rect2Id"+0);
    		console.log(container, rowToScrollTo);
    		container.scrollTop = rowToScrollTo.offsetTop;
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

		controlFlow_2();
	}

	function thirdLayer(secID){
		// comp.select("#alignChart").remove();
		// textDiv.select("pre").remove();
		cleanThirdLayer();
		
		$.getJSON( "data/data.php", { section: secID} )
			.done(function( data ) {
				console.log(data);
				drawAlignChart(data);
				textDiv.append("pre")
					.style("width", thirdLayerWidth)
					//.style({"position": "absolute", "top": titleHight + thirdLayerHeight + "px", "left": firstLayerWidth + secondLayerWidth + 50 + "px"})
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
			
			var srt = function(obj1, obj2) {
				return obj1.IntrDate - obj2.IntrDate;
			}
			
			data.matches.sort(srt);
			
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
			
			/*chart.append("rect")
				//.attr("d", "M0," + alignChartHeight + " L" + alignChartHeight + "," + alignChartHeight)
				.attr("x", 0)
				.attr("y", alignChartHeight)
				.attr("height", 2)
				.attr("width", alignChartWidth)
				.attr("fill", "black");*/
		
			var markMaxWidth = 10;
			var markMargin = 8;
			var markWidth = Math.min(markMaxWidth, (alignChartWidth - markMargin)/data.matches.length - markMargin);
		
			chart.selectAll("alignments")
				.data(data.matches)
				.enter()
					.append("rect")
					.attr("class", "alignments")
					//.attr("d", function(d) { return "M" + (timeScale(d.IntrDate) + alignChartPadding) + "," + (alignChartPadding + alignChartHeight - lengthScale(parseInt(d.docAend))) + "L" + (timeScale(d.IntrDate) + alignChartPadding) + "," + (alignChartPadding + alignChartHeight - lengthScale(parseInt(d.docAstart)))})
					//.attr("stroke-width", 4)
					//.attr("x", function(d) { return timeScale(d.IntrDate) - markWidth/2 + 4; })
					.attr("x", function(d, i) { return (alignChartWidth - (markWidth + markMargin)*data.matches.length)/2 + i*(markWidth + markMargin) + markMargin})
					.attr("y", function(d) { return alignChartHeight - lengthScale(parseInt(d.docAend)); })
					.attr("height", function(d) { return lengthScale(parseInt(d.docAend)) - lengthScale(parseInt(d.docAstart));})
					.attr("width", markWidth)
					.attr("stroke", "black")
					.attr("stroke-width", 1)
					//.attr("opacity", .5)
					.attr("fill", function(d) { return partyColor(d.Party); })
					.on("mouseover", function(d,i) { 
						d3.select(this)
							.attr("stroke-width", 2)
							.attr("fill", "yellow");
					})
					.on("mouseout", function(d,i) { 
						d3.select(this)
							.attr("stroke-width", 1)
							.attr("fill", function() { return partyColor(d.Party); });
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
						//.attr("width", 2*markWidth)
			var textHeight = 12;
			var curQ = -1;
			var curYear = -1;
			var lastBar = 0;
			for (var i = 0; i < data.matches.length; i++) {
				var date = new Date(data.matches[i].IntrDate * 1000);
				var newQ = Math.ceil((date.getMonth() + .1)/3);
				if (newQ != curQ || date.getYear() != curYear) {
					var x = ((alignChartWidth - (markWidth + markMargin)*data.matches.length)/2 + i*(markWidth + markMargin) + markMargin/2);
					chart.append("path")
						.attr("d", "M" + x + ",0 L" + x + "," + alignChartHeight)
						.attr("stroke-width", 1)
						.attr("stroke", "gray");
					
					if (i != 0) {
						chart.append("text")
							.attr("x", (lastBar + x)/2)
							.attr("y", alignChartHeight + 8)
							.attr("text-anchor", "middle")
							.attr("font-size", 8)
							.text("Q" + curQ);
					
						chart.append("text")
							.attr("x", (lastBar + x)/2)
							.attr("y", alignChartHeight + 2*8)
							.attr("text-anchor", "middle")
							.attr("font-size", 8)
							.text((curYear + 1900));
					}
					
					lastBar = x;
					curQ = newQ;
					curYear = date.getYear();
				}
			}
			var x = ((alignChartWidth - (markWidth + markMargin)*data.matches.length)/2 + data.matches.length*(markWidth + markMargin) + markMargin/2);
			chart.append("path")
				.attr("d", "M" + x + ",0 L" + x + "," + alignChartHeight)
				.attr("stroke-width", 1)
				.attr("stroke", "gray");
			
			chart.append("text")
				.attr("x", (lastBar + x)/2)
				.attr("y", alignChartHeight + 8)
				.attr("text-anchor", "middle")
				.attr("font-size", 8)
				.text("Q" + curQ);
		
			chart.append("text")
				.attr("x", (lastBar + x)/2)
				.attr("y", alignChartHeight + 2*8)
				.attr("text-anchor", "middle")
				.attr("font-size", 8)
				.text((curYear + 1900));
			
			//If the min range is above zero, show dotted line
			//if (minStart > 0) {
				chart.append("path")
					.attr("d", "M0," + (alignChartHeight - lengthScale(minStart)) + " L" + alignChartWidth + "," + (alignChartHeight - lengthScale(minStart)))
					.attr("stroke-width", 1)
					.attr("stroke", "black")
					//.attr("stroke-dasharray", "10,10")
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
			//}
			
			if (maxEnd < data.sectionText.length) {
				chart.append("path")
					.attr("d", "M0," + (alignChartHeight - lengthScale(maxEnd)) + " L" + alignChartWidth + "," + (alignChartHeight - lengthScale(maxEnd)))
					.attr("stroke-width", 2)
					.attr("stroke", "black")
					//.attr("stroke-dasharray", "10,10")
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

	function cleanSecondLayer(){
		sec.selectAll(".rectSecond").remove();
		sec.selectAll(".textGroup").remove();
	}

	function cleanThirdLayer(){
		comp.select("#alignChart").remove();
		textDiv.select("pre").remove();
	}

	function partyColor(party) {
		if (party == "200") {
			return republicanColor;
		} else if (party == "100") {
			return democraticColor;
		} else {
			return independentColor;
		}
	}

	firstLayer();
})();