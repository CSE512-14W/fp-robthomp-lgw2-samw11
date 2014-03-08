(function() {

	// frame variables
    var height = 720,
		width = 900;
		margin = 20
		titleHeight = 70
		bodyMargin = 6;

	// color 
	var layerOneBackgroundColor = d3.rgb(200,200,200),
		republicanColor = "red",
		democraticColor = "blue",
		independentColor = "gray",
		noMatchColor = "grey",
		firstLayerCentralAxis = "grey",
		rectBound = "black",
		layerTwoBackgroundColor = d3.rgb(200,200,200)
		highlight = "white",
		layerThreeBackgroundColor = d3.rgb(200,200,200);

	// data in json format		
	var republicData = [],
		democratData = [],
		noMatchData = [],
		sectionData = [];

	// default sort by secID 
	var sort = "secID";

	// the top title layer variables
	var fontSize = titleHeight - 20;

	// first layer variables
	var rowMax = width / 30,	// the length of each row
		rowHeight,
		axisWidth = 1,		// the central axis width 
		firstLayerWidth = 2 * rowMax + axisWidth,
		firstLayerHeight = height - titleHeight;

		// rectSize_1 = 10,
		// firstLayerWidth = width / 5,
		// firstLayerHeight = 2 * height / 3
		// numRects = Math.floor(firstLayerWidth / rectSize_1),
		// startHeight = 0,
		// heightSoFar = 0,
		// smallFont = 0,
		// fontSize = 50;

	// the window layer between first and second layer
	var windowStart1 = d3.scale.linear(),
		windowSize1 = 0,
		strokeWidth = 2;

	// second layer variables
	var secondLayerWidth = width / 10,
		secondLayerHeight = height - titleHeight,
		rectWidth_2 = secondLayerWidth * 0.9,
		rectHeight_2 = rectWidth_2 / 2;
		boundary = secondLayerWidth * 0.4;
		xPos = 0,
		smallFont = 0;


	// third layer variables
	var thirdLayerWidth = 3*width / 5,
		thirdLayerHeight = height / 3 + 40,
		alignChartWidth = thirdLayerWidth - 50,
		alignChartHeight = height / 3,
		alignChartPadding = 10,
		billInfoDivWidth = 200,
		textDivWidth = thirdLayerWidth
		xPosition = firstLayerWidth + secondLayerWidth + boundary*2 + 2*margin;

	// transition time
	var transTime = 1000;

	d3.select("body")
			// .style({"overflow": "hidden !important"})
			.insert("svg:svg")
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
				.attr("width", firstLayerWidth)
				.attr("height", firstLayerHeight)
				.attr("transform", "translate(0," + titleHeight + ")");

	var sec = d3.select("body")
					.append("div")
					.attr("id", "secLayerDiv")
					.style({
						"position": "absolute", 
						"top": (titleHeight + bodyMargin) + "px", 
						"left": (boundary + 2*margin + firstLayerWidth) + "px",
						"height": secondLayerHeight + "px",
						"width": (secondLayerWidth + margin) + "px",
						"overflow": "scroll"})
					// .attr("onscroll", "scrollPos();")
					// .append("div")
					// .attr("id", "secLayerDiv")
					// .style({
					// 	"position": "absolute", 
					// 	"top": 0 + "px",//(titleHeight + bodyMargin) + "px", 
					// 	"left": 0 + "px",//(boundary + 2*margin + firstLayerWidth) + "px",
					// 	// "height": height + "px",
					// 	"width": (secondLayerWidth + margin) + "px",
					// 	"overflow": "scroll"})
					.append("svg:svg")
					.attr("width", secondLayerWidth);
					// .style({"display": "block"})
					// .style({"vertical-align":"top"});

	var win1 = d3.select("svg")
					.append("g")
					.attr("id", "between1And2Layer")
					.attr("width", boundary)
					.attr("height", secondLayerHeight)
					.attr("transform", "translate(" + firstLayerWidth + "," + titleHeight + ")");

	var comp = d3.select("svg")
				.append("g")
				.attr("id", "thirdLayout")
				.attr("transform", "translate(" + xPosition + "," + titleHeight + ")");

	var textDiv = d3.select("body")
					.append("div")
					.style({
						"position": "absolute", 
						"top": (titleHeight + thirdLayerHeight) + "px", 
						"left": xPosition + "px",
						"height": (height - thirdLayerHeight) + "px",
						"width": textDivWidth + "px",
						"overflow": "scroll"});
	
	var billTextDiv = d3.select("body")
					.append("div")
					.style({
						"position": "absolute", 
						"top": (titleHeight + thirdLayerHeight) + "px", 
						"left": (xPosition + textDivWidth) + "px",
						"height": (height - thirdLayerHeight) + "px",
						"width": textDivWidth + "px",
						"overflow": "scroll"});
	
	var billInfoDiv = d3.select("body")
						.append("div")
						.style({
							"position": "absolute", 
							"top": titleHeight + "px", 
							"left": (xPosition + thirdLayerWidth + 60) + "px",
							"height": height + "px",
							"width": billInfoDivWidth + "px",
							"overflow": "scroll"});
	
	//TODO do we need this?
	d3.select("svg")
		.style({
			"position": "absolute", 
			"top": 10, 
			"left": 10});

	// sort data by match number and than by section id
	function sortData(array, key, asec){
		sort = key;
		array.sort(function(a, b) {
			if (asec) {
				return a[key] > b[key] ? 1 : ((a[key] < b[key]) ? -1 : 0);
			} else {
				return a[key] > b[key] ? -1 : ((a[key] < b[key]) ? 1 : 0);
			}
			// // greater matchNum first 
			// var diff = a["matchNum"] > b["matchNum"] ? -1 : ((a["matchNum"] < b["matchNum"]) ? 1 : 0);
			// // TODO date?
			// if (diff == 0){
			// 	// smaller secId first
			// 	diff = a["secID"] > b["secID"] ? 1 : ((a["secID"] < b["secID"]) ? -1 : 0);
			// }
			// return diff;
		});
	}

	function scrollPos(){
		var div = document.getElementById("secLayerDiv").scrollTop;
		// move the window
		var upperLine = d3.select("#upperLineId")
							.attr("y1", windowStart1(div));

		var lowerLine = d3.select("#lowerLineId")
						.attr("y1", windowStart1(div) + windowSize1);
		console.log("scrollpos",div, windowSize1, windowStart1(div) );
	}

	// Logic of the first layer
	function firstLayer(){

		 // Load the data
		d3.json("./data/layer1.json",
				function(d) {
					sectionData = d.map(function(d) {
						return {
							secID : d.secID,
							matchNum : d.matchingBills,
							date : new Date(d.minDate*1000),
							party : d.party,
							hr200 : d.HR200,
							s200 : d.S200,
							hr100 : d.HR100,
							s100 : d.S100
						}
						// if (d.party == 100){
						// 	// republican
						// 	republicData.push({secID:d.secID, matchNum:d.matchingBills,date: new Date(d.minDate*1000)});
						// } else if (d.party == 200) {
						// 	democratData.push({secID:d.secID, matchNum:d.matchingBills,date: new Date(d.minDate*1000)});
						// } else {
						// 	noMatchData.push({secID:d.secID, matchNum:d.matchingBills,date: new Date(d.minDate*1000)});
						// }
					});
					// start drawing the visualization
		 			controlFlow_1();
		 			
		 			// d.sort(function(a,b) {
		 			// 	return a["secID"].localeCompare(b["secID"]);
		 			// })
				});

		function controlFlow_1(){
			rowHeight = firstLayerHeight/sectionData.length;
			// console.log(firstLayerHeight, sectionData.length, rowHeight);
			// sort by secID
			sortData(sectionData, "secID", "asec");
			// sortData(sectionData, "matchNum");
			// sortData(sectionData, "party");
			// sortData(sectionData, "date");
			//sortData(democratData);
			// we don't care about the no match data for now
			draw_1(rowHeight);
			// direct to second layer
			toSecondLayer();
			//toRepublicanSecLayer();
		}

		

		function draw_1(rowHeight){

			//the axis
 			svg.append("rect")
 				.attr("width", axisWidth)
				.attr("height", rowHeight * sectionData.length)
				.attr("x", function(d, i) { return margin + rowMax; })
				.attr("y", 0)
				.attr("fill", firstLayerCentralAxis);
 			
 			svg.selectAll("repRow_1")
				.data(sectionData)
				.enter()
				.append("rect")
				.attr("id", function(d, i) { return "repRow_1Id" + i; })
				.attr("class", "repRow_1")
				.attr("width", function(d) { return Math.min(d["s200"] + d["hr200"], rowMax); })
				.attr("height", rowHeight)
				.attr("x", function(d, i) { return margin + rowMax + axisWidth; })
				.attr("y", function(d, i) { return i*rowHeight; })
				.attr("fill", republicanColor);
				
			svg.selectAll("demRow_1")
				.data(sectionData)
				.enter()
				.append("rect")
				.attr("id", function(d, i) { return "demRow_1Id" + i; })
				.attr("class", "demRow_1")
				.attr("width", function(d) { return Math.min(d["s100"] + d["hr100"], rowMax); })
				.attr("height", rowHeight)
				.attr("x", function(d, i) { return margin + rowMax - Math.min(d["s100"] + d["hr100"], rowMax); })
				.attr("y", function(d, i) { return i*rowHeight; })
				.attr("fill", democraticColor);

			// TODO need a window rect


			// svg.selectAll("republican")
			// 	.data(republicData)
			// 	.enter()
			// 	.append("rect")
			// 	.attr("id", function(d, i) { return "republicId" + i; })
			// 	.attr("class", "republician")
			// 	.attr("width", rectSize_1)
			// 	.attr("height", rectSize_1)
			// 	.attr("x", function(d, i) { return margin + (i*rectSize_1 %firstLayerWidth); })
			// 	.attr("y", function(d, i) { heightSoFar = startHeight + Math.floor(i/numRects) *rectSize_1; return heightSoFar; })
			// 	.attr("fill", republicanColor)
			// 	.attr("stroke", rectBound)
			// 	.on("click", toRepublicanSecLayer);

			// heightSoFar += rectSize_1;
			// startHeight = heightSoFar;

			// svg.selectAll("democrat")
			// 	.data(democratData)
			// 	.enter()
			// 	.append("rect")
			// 	.attr("id", function(d, i) { return "democratId" + i; })
			// 	.attr("class", "democrat")
			// 	.attr("width", rectSize_1)
			// 	.attr("height", rectSize_1)
			// 	.attr("x", function(d, i) { return margin + (i*rectSize_1 %firstLayerWidth); })
			// 	.attr("y", function(d, i) { heightSoFar = startHeight + Math.floor(i/numRects) *rectSize_1; return heightSoFar;})
			// 	.attr("fill", democraticColor)
			// 	.attr("stroke", rectBound)
			// 	.on("click", toDemocratSecLayer);

			// heightSoFar += rectSize_1;

			// svg.selectAll("noMatch")
			// 	.data(noMatchData)
			// 	.enter()
			// 	.append("rect")
			// 	.attr("id", function(d, i) { return "noMatchId" + i; })
			// 	.attr("class", "noMatch")
			// 	.attr("width", rectSize_1)
			// 	.attr("height", rectSize_1)
			// 	.attr("x", function(d, i) { return margin + (i*rectSize_1 %firstLayerWidth); })
			// 	.attr("y", function(d, i) { return heightSoFar + Math.floor(i/numRects) *rectSize_1; })
			// 	.attr("fill", noMatchColor)
			// 	.attr("stroke", rectBound);
		}

		function toSecondLayer(){
			secondLayer(sectionData);
		}
		// function toRepublicanSecLayer(d, i){
		// 	secondLayer(republicData, "R");
		// }

		// function toDemocratSecLayer(d, i){				
		// 	secondLayer(democratData, "D");
		// }
	}
	
	function secondLayer(data){
			
		var totalHeight = 0,
			axisWidth_2 = axisWidth * 2,
			// dem and rep bar width
			scaleWidth = d3.scale.linear()
							.domain([0, rowMax])
							.range([0, rectWidth_2/2-axisWidth_2/2]);
			// x position for rep
			xPos = d3.scale.linear()
						.domain([0, rowMax])
						.range([rectWidth_2/2-axisWidth_2/2, rectWidth_2]);

		// var container = document.getElementById("secLayerDiv").on("mouseWheel DOMMouseScroll", scrollPos);
		var container = $("#secLayerDiv").on("mouseWheel DOMMouseScroll", scrollPos);
    	// var rowToScrollTo = document.getElementById("rect2Id"+0);

  //   	function scroll(e) {
  //   		var first = d3.select("#rectSecId0");
  //   		var rowToScrollTo = document.getElementById("rectSecId"+0);

  //   		console.log(container.scrollTop, rowToScrollTo.x, first[0][0].getBBox());	
  //   	}
		// if (party === "R"){
		// 	color = republicanColor;
		// 	Id = "#demRowId";
		// } else {
		// 	color = democraticColor;
		// 	Id = "#demRowId";
		// }

		function controlFlow_2(){
			// cleanup first
			cleanSecondLayer();
			cleanThirdLayer();
			// calculate the total height
			var totalHeight = data.length * (rectHeight_2 + margin) - margin;
			draw_2();
			//console.log(totalHeight);
			sec.attr("height", totalHeight);
			windowSize1 = secondLayerHeight / (rectHeight_2 + margin) * rowHeight;
			windowStart1.domain([0, totalHeight])
						.range([0, secondLayerHeight]);
			// console.log(secondLayerHeight, (rectHeight_2 + margin), rowHeight);
			windowLayer1();
			// scrollUp();
			toThirdLayer(data[0]);
		}

    	function draw_2(){
    		// rect boxes
			sec.append("g").selectAll("rectRow_2")
				.data(data)
				.enter()
				.append("g:rect")
				.attr("id", function(d, i) { return "rectSecId" + i; })
				.attr("class", "rectRow_2")
				.attr("width", 1)
				.attr("height", 1)
				// .attr("x", function(d, i) { return margin + (i*rectSize_1 %firstLayerWidth); })
				// .attr("y", function(d, i) { return startHeight + Math.floor(i/numRects) *rectSize_1; })
				.attr("x", rectWidth_2/2)
				.attr("y", function(d, i) { return rectHeight_2/2 + i*(rectHeight_2+margin); })
				.attr("fill", "white")
				.attr("stroke", rectBound)
				.style("opacity", 0.1)
				// .on("click", toThirdLayer)
				// .on("mouseover", showTip)
				// .on("mouseleave", hideTip)
				// .call(scroll)
				// .on("dblclick.zoom", null)
				.transition()
				.duration(transTime)
				.attr("width", rectWidth_2)
				.attr("height", rectHeight_2)
				.attr("x", 0)//function(d, i) { return boundary + 2*margin + firstLayerWidth; })
				.attr("y", function(d, i) { return i*(rectHeight_2+margin); })
				.attr("fill", "white")
				.attr("stroke", rectBound)
				.style("opacity", 1);

			

			sec.selectAll("repRow_2")
				.data(data)
				.enter()
				.append("rect")
				.attr("id", function(d, i) { return "repRow_2Id" + i; })
				.attr("class", "repRow_2")
				.attr("width", 0)
				.attr("height", 0)
				.attr("x", rectWidth_2/2)
				.attr("y", function(d, i) { return rectHeight_2/2 + i*(rectHeight_2+margin); })
				.transition()
				.duration(transTime)
				.attr("width", function(d) { return scaleWidth(Math.min(d["s200"] + d["hr200"], rowMax)); })
				.attr("height", rectHeight_2)
				.attr("x", function(d, i) { return rectWidth_2 / 2 + axisWidth / 2; })
				.attr("y", function(d, i) { return i*(rectHeight_2+margin); })
				.attr("fill", republicanColor);
				
			sec.selectAll("demRow_2")
				.data(data)
				.enter()
				.append("rect")
				.attr("id", function(d, i) { return "demRow_2Id" + i; })
				.attr("class", "demRow_2")
				.attr("width", 0)
				.attr("height", 0)
				.attr("x", rectWidth_2/2)
				.attr("y", function(d, i) { return rectHeight_2/2 + i*(rectHeight_2+margin); })
				.transition()
				.duration(transTime)
				.attr("width", function(d) { return scaleWidth(Math.min(d["s100"] + d["hr100"], rowMax)); })
				.attr("height", rectHeight_2)
				.attr("x", function(d, i) { return rectWidth_2 / 2 - axisWidth_2 / 2 - scaleWidth(Math.min(d["s100"] + d["hr100"], rowMax)) ; })
				.attr("y", function(d, i) { return i*(rectHeight_2+margin); })
				.attr("fill", democraticColor);



			// center axis
 			sec.append("g").selectAll("centralAxis")
 				.data(data)
 				.enter()
 				.append("g:rect")
 				.attr("class", "axis_2")
				.attr("width", 0)
				.attr("height", 0)
				.attr("x", rectWidth_2/2)
				.attr("y", function(d, i) { return rectHeight_2/2 + i*(rectHeight_2+margin); })
				.attr("fill", firstLayerCentralAxis)
				.style("opacity", 0.1)
 				.transition()
				.duration(transTime)
 				.attr("width", axisWidth_2)
				.attr("height", rectHeight_2)
				.attr("x", rectWidth_2 / 2 - axisWidth_2 / 2)
				.attr("y", function(d, i) { return i*(rectHeight_2+margin); })
				.attr("fill", firstLayerCentralAxis)
				.style("opacity", 1);
			// totalHeight += rectHeight_2;

			
			// sec.append("g").selectAll("textGroup")
			// 	.data(data)
			// 	.enter()
			// 	.append("g:text")
			// 	.attr("id", function(d, i) { return "textId" + i; })
			// 	.attr("class", "textGroup")
			// 	// .attr("x", function(d, i) { return margin + (i*rectSize_1 %firstLayerWidth); })
			// 	// .attr("y", function(d, i) { return startHeight + Math.floor(i/numRects) *rectSize_1; })
			// 	.attr("x", rectWidth_2/2)
			// 	.attr("y", function(d, i) { return (i)*(rectHeight_2+margin) + rectHeight_2/2; })
			// 	.text(function(d) { return d.matchNum;})
			// 	.attr("font-size", smallFont)
			// 	.attr("text-anchor", "middle")
			// 	.style("opacity", 0.1)
			// 	// .on("click", toThirdLayer)
			// 	// .on("mouseover", showTip)
			// 	// .on("mouseleave", hideTip)
			// 	// .call(scroll)
			// 	// .on("dblclick.zoom", null)
			// 	.transition()
			// 	.duration(transTime)
			// 	.attr("x", rectWidth_2/2)//function(d, i) { return (rectSize_2/2) + boundary + 2*margin + firstLayerWidth; })
			// 	.attr("y", function(d, i) { return (i)*(rectHeight_2+margin) + 2*rectHeight_2/3; })
			// 	.attr("font-size", rectHeight_2/2)
			// 	.style("opacity", 1);	


    	}

    	function currectSort() {
    		// TODO
    		if (sort === "secID"){

    		} else if (sort === "") {

    		} 
    	}

    	function rectColor(data) {
    		if (data.party == 100) return democraticColor; 
			else if (data.party == 200) return republicanColor; 
			else return noMatchColor;
    	}

    	function scrollUp(){
    		var container = document.getElementById("secLayerDiv");
    		var rowToScrollTo = document.getElementById("rect2Id"+0);
    		console.log(container, rowToScrollTo);
    		//container.scrollTop = rowToScrollTo.offsetTop;
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
				.attr("fill", rectColor);
			sec.select("#rect2Id"+i)
				.attr("fill", rectColor);
		}
		
		function toThirdLayer(d){
			console.log("sec id: " + d.secID);
			thirdLayer(d.secID);
		}


		controlFlow_2();
	}

	// the window between first and seond layer
	function windowLayer1(){
		// windowStart1 ;
		// draw 2 lines
		win1.append("g:line")
			.attr("id", "upperLineId")
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("x2", boundary + margin)
			.attr("y2", 0)
			.attr("stroke", "black")
			.attr("stroke-width", strokeWidth);

			// console.log("window size", windowSize1);
		win1.append("g:line")
			.attr("id", "lowerLineId")
			.attr("x1", 0)
			.attr("y1", 0 + windowSize1)
			.attr("x2", boundary + margin)
			.attr("y2", secondLayerHeight)
			.attr("stroke", "black")
			.attr("stroke-width", strokeWidth);

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
					//.style({"position": "absolute", "top": titleHeight + thirdLayerHeight + "px", "left": firstLayerWidth + secondLayerWidth + 50 + "px"})
					.html("<span style='background-color: red'>if this is highlighted, this method works</span>" + data.sectionText)
			});
		
		//TODO: still need to add axis labels
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
						cleanBillInfo();
						writeBillInfo(d);
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

	function writeBillInfo(d) {
		billInfoDiv.append("h1")
			.attr("class", "BillInfo")
			.text(d.BillType + d.BillNum)
		
		var date = new Date(d.IntrDate * 1000);
		
		billInfoDiv.append("p")
			.attr("class", "BillInfo")
			.text("Introduced " + date);
		
		billInfoDiv.append("p")
			.attr("class", "BillInfo")
			.text("Author: " + d.NameFull + " (" + d.Postal + ")");
		
		billInfoDiv.append("p")
			.attr("class", "BillInfo")
			.text("Party: " + d.Party);
		
		billInfoDiv.append("p")
			.attr("class", "BillInfo")
			.append("a")
				.attr("href", d.URL)
				.text("Full Text");
		
		billTextDiv.append("pre")
				.attr("class", "billText")
				.style("width", thirdLayerWidth)
				//.style({"position": "absolute", "top": titleHeight + thirdLayerHeight + "px", "left": firstLayerWidth + secondLayerWidth + 50 + "px"})
				.html("<span style='background-color: yellow'>why not yellow</span>" + d.matchText)
	}
	
	function cleanBillInfo() {
		billTextDiv.select(".billText").remove();
		billInfoDiv.selectAll(".BillInfo").remove();
	}
	
	function cleanSecondLayer(){
		sec.selectAll(".rectSecond").remove();
		sec.selectAll(".textGroup").remove();
	}

	function cleanThirdLayer(){
		comp.select("#alignChart").remove();
		textDiv.select("pre").remove();
		cleanBillInfo();
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