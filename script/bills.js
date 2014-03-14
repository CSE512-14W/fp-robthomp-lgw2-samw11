(function() {
	/*
		Core TODO:
			"Mark as boilerplate" button somewhere
			Add description text on top right
		
		Style TODO:
			Title: 
				decide on title text, size and font
			Sort Buttons: 
				add mouseover
				make size better
				add background color
			Layer 1: 
				Highlight row currently shown in layer 3
				Draw window over current scroll region from region 2
					Make window draggable
			Layer 2:
				Have scroll arrow "squash" when user scrolls selection offscreen
				Hide/Custom scroll bar?
				Add some loading indicator on button when waiting on layer 3
			Alignment Chart:
				Add label on vertical axis
				Add texture to show house or senate bill type
			Section Text:
				Hide/Custom scroll bar?
			Matching Bill Info:
				strip time from date row
				show if bill became law or not
	*/
	
	var titleText = "How a bill becomes a law";
	// frame variables
    var height = 720,
		width = 1080,
		margin = 20,
		titleHeight = 40,
		sortHeight = 20,
		headerHeight = 70,
		bodyMargin = 6;

	// color 
	var layerOneBackgroundColor = d3.rgb(200,200,200), // didn't use
		republicanColor = "#fda4a7",//"#95474c",
		democraticColor = "#99c0e5",//"#396283",
		independentColor = "gray",
		noMatchColor = "grey",
		firstLayerCentralAxis = "grey",
		layerTwoBackgroundColor = d3.rgb(200,200,200)
		highlight = "yellow",
		backgroundColor = "white",
		strokeColor = "black",
		highlightColor = "#ffffbb",
		layerThreeBackgroundColor = d3.rgb(200,200,200),
		otherBillBackground = "#eeeeee";

	// data in json format		
	var sectionData = [];

	// default settings sort by secID 
	var currSort = "SecID",
		clickedId = 0,
		isFirst = true; // is it first page load?

	// the top title layer variables
	var fontSize = 2*titleHeight / 3;
	var fontFamily = "Arial,Helvetica";

	// first layer variables
	var rowMax = width / 30,	// the length of each row
		rowHeight,
		axisWidth = 1,		// the central axis width 
		firstLayerWidth = 2 * rowMax + axisWidth,
		firstLayerHeight = height - headerHeight - margin;

	// the window layer between first and second layer
	var windowStart1 = d3.scale.linear(),
		windowSize1 = 0,
		strokeWidth = 2;

	// second layer variables
	var secondLayerWidth = width / 12,
		secondLayerHeight = height - headerHeight - margin,
		rectWidth_2 = secondLayerWidth * 0.9,
		rectHeight_2 = rectWidth_2 / 2;
		boundary = secondLayerWidth * 0.4;
		xPos = 0,
		smallFont = 0,
		totalHeight = 0,
		axisWidth_2 = axisWidth * 2,
		// dem and rep bar width
		scaleWidth = d3.scale.linear()
						.domain([0, rowMax])
						.range([0, rectWidth_2/2-axisWidth_2/2]);
		// x position for rep
		xPos = d3.scale.linear()
					.domain([0, rowMax])
					.range([rectWidth_2/2-axisWidth_2/2, rectWidth_2]);

	// the window layer between second and third layer
	var windowHeight2 = rectHeight_2;

	// third layer variables
	var alignChartWidth = 600,
		alignChartHeight = (height - 2*margin) / 3,
		alignChartPadding = 10,
		billInfoDivWidth = 360,
		textDivWidth = (alignChartWidth + billInfoDivWidth + margin)/2,
		xPosition = firstLayerWidth + secondLayerWidth + boundary*2 + 2*margin,
		sectionFontFamily = "",
		sectionFontSize = "11px";

	// transition time
	var transTime = 1000;

	d3.select("body")
		.style("margin", "0px")
		.insert("svg:svg")
		.attr("width", width)
		.attr("height", height);

	var titleRegion = d3.select("svg");


	var svg = d3.select("svg")
				.append("g")
				.attr("id", "firstLayout")
				.attr("width", firstLayerWidth)
				.attr("height", firstLayerHeight)
				.attr("transform", "translate(" + margin + "," + (headerHeight + margin) + ")");

	var sec = d3.select("body")
					.append("div")
					.attr("id", "secLayerDiv")
					.style({
						"position": "absolute", 
						"top": (headerHeight + margin) + "px", 
						"left": (2*margin + firstLayerWidth) + "px",
						"height": secondLayerHeight + "px",
						"width": (secondLayerWidth + margin) + "px",
						"overflow": "scroll"})
					.append("svg:svg")
					.attr("width", secondLayerWidth);

	var win1 = d3.select("svg")
				.append("g")
				.attr("id", "between1And2Layer")
				.attr("width", boundary)
				.attr("height", secondLayerHeight)
				.attr("transform", "translate(" + (margin + firstLayerWidth) + "," + (headerHeight + margin) + ")");

	var win2 = d3.select("svg")
				.append("g")
				.attr("id", "between2And3Layer")
				.attr("width", boundary)
				.attr("height", secondLayerHeight)
				.attr("transform", "translate(" + (firstLayerWidth + secondLayerWidth + margin*2) + "," + (headerHeight + margin) + ")");							

	var comp = d3.select("svg")
				.append("g")
				.attr("id", "thirdLayout")
				.attr("transform", "translate(" + (firstLayerWidth + secondLayerWidth + margin*3) + "," + (headerHeight + margin) + ")");

	var textDiv = d3.select("body")
					.append("div")
					.style({
						"position": "absolute", 
						"top": (headerHeight + alignChartHeight + margin*2) + "px", 
						"left": (firstLayerWidth + secondLayerWidth + margin*3) + "px",
						"height": (height - headerHeight - alignChartHeight - 2*margin) + "px",
						"width": textDivWidth + "px",
						"overflow": "scroll"});
	
	var billTextDiv = d3.select("body")
					.append("div")
					.style({
						"position": "absolute", 
						"top": (headerHeight + alignChartHeight + margin*2) + "px", 
						"left": (firstLayerWidth + secondLayerWidth + margin*3 + textDivWidth + margin) + "px",
						"height": (height - headerHeight - alignChartHeight - 2*margin) + "px",
						"width": textDivWidth + "px",
						"overflow": "scroll"});
	
	var billInfoDiv = d3.select("body")
						.append("div")
						.style({
							"position": "absolute", 
							"top": (headerHeight + margin) + "px", 
							"left": (firstLayerWidth + secondLayerWidth + margin*5 + alignChartWidth) + "px",
							"height": alignChartHeight + margin + "px",
							"width": billInfoDivWidth + "px",
							"font-family": fontFamily,
							"background-color": otherBillBackground,
							"overflow": "scroll"});

	// sort data by match number and than by section id
	function sortData(array, key, asec){
		// console.log("before clicked ID update " + clickedId)
		// update the click id
		var secId = array[clickedId].secID;
		array.sort(function(a, b) {
			if (asec) {
				return a[key] > b[key] ? 1 : ((a[key] < b[key]) ? -1 : 0);
			} else {
				return a[key] > b[key] ? -1 : ((a[key] < b[key]) ? 1 : 0);
			}
		});

		if (isFirst) {
			return;
		}
		for (var i = 0; i < array.length; i++){
			if (array[i].secID === secId) {
				// console.log("update clicked id " + i);
				clickedId = i;
				return;
			}
		}
	}

	function scrollPos(){
		var div = document.getElementById("secLayerDiv").scrollTop;
		// move the window between 1 and 2 layer
		d3.select("#upperLine_1Id")
							.attr("y1", windowStart1(div));

		d3.select("#lowerLine_1Id")
						.attr("y1", windowStart1(div) + windowSize1);
		
		d3.select("#box_1Id")
						.attr("y", windowStart1(div));

		thirdLayerPointer(div);
	}

	// the window allow between 2nd and 3rd layer
	function thirdLayerPointer(div){
		// TODO need to make this smoother
		var selectedBox = d3.select("#rectSecId"+clickedId)[0][0].y.animVal.value;
		
		var y = Math.min(Math.max(selectedBox - div, 0), secondLayerHeight - windowHeight2);

		// console.log(div, selectedBox, y);
		// move the window between 2 and 3 layer
		d3.select("#upperLine_2Id")
			.attr("y1", y + rectHeight_2 / 2)
			.attr("y2", y );

		d3.select("#lowerLine_2Id")
			.attr("y1", y + rectHeight_2 / 2)
			.attr("y2", y + rectHeight_2);
	}

	function sortButton(){
		titleRegion.append("g")
					.append("text")
					.attr("id", "visTitle")
					.attr("x", margin)
					.attr("y", fontSize)
					.text(titleText)
					.attr("font-size", fontSize);


		var sortRegion = titleRegion.append("g")
							.attr("transform", "translate(" + margin + "," + (titleHeight + 10) + ")");

		var sortByHeight = sortHeight,
			sortByWidth = 250;
			buttonWidth = 50;
		
		var data = [{name:"SecID", sort:"secID"}, {name:"Date", sort:"date"}, {name:"Match", sort:"matchNum"}]

		sortRegion.append("rect")
					.attr("id", "sortRegionID")
					.attr("x", 0)
					.attr("y", 0)
					.attr("width", sortByWidth)
					.attr("height", sortByHeight)
					.attr("fill", backgroundColor)
					.attr("stroke", strokeColor)
					// .attr("stroke-width", strokeWidth)
					.style("opacity", 0.1);

		sortRegion.append("text")
					.attr("id", "sortBytextID")
					.attr("class", "sortText")
					.attr("x", 5)
					.attr("y", 2*sortByHeight/3)
					.text("Sort by:")
					.attr("font-size", 2*sortByHeight/3);

		sortRegion.selectAll("sortText")
					.data(data)
					.enter()
					.append("text")
					.attr("class", "sortText")
					.attr("id", function (d, i) { return "sortByTextId" + i; })
					.attr("x", function (d, i) { return sortByWidth - (data.length - i)*buttonWidth + buttonWidth/2; })
					.attr("y", 2*sortByHeight/3)
					.attr("text-anchor", "middle")
					.text(function (d) { return d.name; })	
					.attr("font-size", sortByHeight/2);

		// sec id sorted button
		sortRegion.selectAll("sortedButton")
					.data(data)
					.enter()
					.append("rect")
					.attr("id", function (d, i) { return "sortBoxID" + i; })
					.attr("class", "sortedButton")
					.attr("x", function (d, i) { return sortByWidth - (data.length - i)*buttonWidth; })
					.attr("y", 0)
					.attr("width", buttonWidth)
					.attr("height", sortByHeight)
					.attr("fill", backgroundColor)
					.attr("stroke", strokeColor)
					.style("opacity", 0.1)
					.on("click", rearrange);
	}

	function rearrange (d) {

		var sortBy = d.name;
		// console.log(sortBy, currSort);
		if (currSort === sortBy) {
			// it's the same, no need to resort
			return;
		} 
		currSort = sortBy;
		// console.log(sortBy); 
		if (sortBy === "Sec ID"){
			sortData(sectionData, d.sort, "asec");
		} else {
			sortData(sectionData, d.sort);
		}
		isFirst = false;
		firstLayer();
	}

	// Logic of the first layer
	function firstLayer(){
		if (isFirst) {
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
		} else {
			// need to clean up
			cleanFirstLayer();
			cleanWindow1Layer();
			controlFlow_1();
		}

		function controlFlow_1(){
			rowHeight = firstLayerHeight/sectionData.length;
			// console.log(firstLayerHeight, sectionData.length, rowHeight);
			// sort by secID
			if (isFirst) {
				sortData(sectionData, "secID", "asec");
			} 
			
			draw_1(rowHeight);
			// direct to second layer
			toSecondLayer();
		}

		function draw_1(rowHeight){

			//the axis
 			svg.append("rect")
 				.attr("id", "firstLayerAxis")
 				.attr("width", axisWidth)
				.attr("height", rowHeight * sectionData.length)
				.attr("x", rowMax)
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
				.attr("x", function(d, i) { return rowMax + axisWidth; })
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
				.attr("x", function(d, i) { return rowMax - Math.min(d["s100"] + d["hr100"], rowMax); })
				.attr("y", function(d, i) { return i*rowHeight; })
				.attr("fill", democraticColor);

			// TODO need a window rect or the boarder?
		}

		function toSecondLayer(){
			secondLayer(sectionData);
		}
	}
	
	function secondLayer(data){

		var container = $("#secLayerDiv").on("mousewheel DOMMouseScroll", scrollPos);

		function controlFlow_2(){
			// cleanup first
			cleanSecondLayer();
			cleanWindow2Layer();
			if (isFirst) {
				// don't clean the third layer if it's reordering 
				cleanThirdLayer();
			}
			// calculate the total height
			totalHeight = data.length * (rectHeight_2 + margin) - margin;
			draw_2();
			//console.log(totalHeight);
			sec.attr("height", totalHeight);
			windowSize1 = secondLayerHeight / (rectHeight_2 + margin) * rowHeight;
			windowStart1.domain([0, totalHeight])
						.range([0, secondLayerHeight]);
			// console.log(secondLayerHeight, (rectHeight_2 + margin), rowHeight);
			scrollUp();
			// TODO: don't support chrome
			var div = document.getElementById("secLayerDiv").scrollTop;
			// var chrome = $("#secLayerDiv").height();
			// console.log(chrome, div);
			// TODO: need to transition based on the clicked Id
			windowLayer1(windowStart1(div));
			windowLayer2();
			// console.log(div);
			
			if (isFirst) {
				toThirdLayer(data[clickedId], clickedId);
			}
		}

    	function draw_2(){
    		// rect boxes
			
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
 			sec.append("g").selectAll("axis_2")
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

			
			sec.append("g").selectAll("textGroup")
				.data(data)
				.enter()
				.append("g:text")
				.attr("id", function(d, i) { return "textId" + i; })
				.attr("class", "textGroup")
				// .attr("x", function(d, i) { return margin + (i*rectSize_1 %firstLayerWidth); })
				// .attr("y", function(d, i) { return startHeight + Math.floor(i/numRects) *rectSize_1; })
				.attr("x", rectWidth_2/2)
				.attr("y", function(d, i) { return (i)*(rectHeight_2+margin) + rectHeight_2/2; })
				.text(currentSort)
				.attr("font-size", smallFont)
				.attr("text-anchor", "middle")
				.attr("font-family", fontFamily)
				.style("opacity", 0.1)
				// .on("click", toThirdLayer)
				// .on("mouseover", showTip)
				// .on("mouseleave", hideTip)
				// .call(scroll)
				// .on("dblclick.zoom", null)
				.transition()
				.duration(transTime)
				.attr("x", rectWidth_2/2)//function(d, i) { return (rectSize_2/2) + boundary + 2*margin + firstLayerWidth; })
				.attr("y", function(d, i) { return (i)*(rectHeight_2+margin) + 2*rectHeight_2/3; })
				.attr("font-size", rectHeight_2/2)
				.style("opacity", 1);	

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
				.attr("fill", backgroundColor)
				.attr("stroke", strokeColor)
				.style("opacity", 0.1)
				.on("click", toThirdLayer)
				.on("mouseover", showTip)
				.on("mouseleave", hideTip)
				// .call(scroll)
				// .on("dblclick.zoom", null)
				.transition()
				.duration(transTime)
				.attr("width", rectWidth_2)
				.attr("height", rectHeight_2)
				.attr("x", 0)//function(d, i) { return boundary + 2*margin + firstLayerWidth; })
				.attr("y", function(d, i) { return i*(rectHeight_2+margin); })
				.attr("fill", backgroundColor)
				.attr("stroke", strokeColor);
				// .style("opacity", 1);

    	}

    	function currentSort(d) {
    		if (currSort === "SecID"){
    			return d.secID;
    		} else if (currSort === "Date") {
    			var date = d.date;
    			//console.log("year " + dateFormat(date, "mm-dd-yy"));//date.format("mm-dd-yy"));
    			return (date.getMonth() + 1) + "-" + date.getDate() + "-" + (date.getFullYear() + "").substr(2);
    		} else if (currSort === "Match") {
    			return d.matchNum;
    		} else {
    			return "null"; // should not happen
    		}
    	}

    	function rectColor(data) {
    		if (data.party == 100) return democraticColor; 
			else if (data.party == 200) return republicanColor; 
			else return noMatchColor;
    	}

    	function scrollUp(){
    		var container = document.getElementById("secLayerDiv");
    		var rowToScrollTo = document.getElementById("rectSecId"+clickedId);
    		// TODO didn't support chrome
    		rowToScrollTo.scrollIntoView(true);
    		// console.log(container.scrollTop, rowToScrollTo, clickedId);
    		// container.scrollTop = rowToScrollTo.offsetTop;
    	}

		function showTip(d, i){
			// svg.select(Id+i)
			// 	.attr("fill", highlight);
			sec.select("#rectSecId"+i)
				.attr("fill", highlight);
			//console.log(d.date);
		}

		function hideTip(d, i){
			// svg.select(Id+i)
			// 	.attr("fill", rectColor);
			if (i != clickedId) {
				sec.select("#rectSecId"+i)
					.attr("fill", backgroundColor);
			}
		}
		
		function toThirdLayer(d, i){
			// cancel the previous one
			d3.select("#rectSecId" + clickedId)
				.attr("stroke-width", 1)
				.attr("fill", backgroundColor)
				.style("opacity", 0.1);

			clickedId = i;

			// change the clicked one
			d3.select("#rectSecId" + clickedId)
				.attr("stroke-width", strokeWidth)
				.style("opacity", 0.5);

			var div = document.getElementById("secLayerDiv").scrollTop;
			thirdLayerPointer(div);

			console.log("sec id: " + d.secID, clickedId);
			thirdLayer(d.secID);
		}

		controlFlow_2();
	}

	// the window between first and second layer
	function windowLayer1(yPos){
		// windowStart1 ;
		// draw 2 lines
		// console.log("ypos", yPos);
		win1.append("g:line")
			.attr("id", "upperLine_1Id")
			.attr("x1", 0)
			.attr("y1", yPos)
			.attr("x2", margin)
			.attr("y2", 0)
			.attr("stroke", strokeColor)
			.attr("stroke-width", strokeWidth);

			// console.log("window size", windowSize1);
		win1.append("g:line")
			.attr("id", "lowerLine_1Id")
			.attr("x1", 0)
			.attr("y1", yPos + windowSize1)
			.attr("x2", margin)
			.attr("y2", secondLayerHeight)
			.attr("stroke", strokeColor)
			.attr("stroke-width", strokeWidth);
		
		/*win1.append("g:path")
			.attr("id", "lowerLine_1Id")
			.attr("d", "M" + 0 + "," + (yPos + windowSize1) + "C" + (margin/3) + "," + (yPos + windowSize1 + (secondLayerHeight - yPos - windowSize1)/5) + " " + (2*margin/3) + "," + (yPos + windowSize1 + 1*(secondLayerHeight - yPos - windowSize1)/5) + " " + (margin) + "," + (secondLayerHeight))
			.attr("stroke", strokeColor)
			.attr("stroke-width", 1);*/
		
		win1.append("g:rect")
			.attr("id", "box_1Id")
			.attr("x", -firstLayerWidth)
			.attr("y", yPos)
			.attr("width", firstLayerWidth)
			.attr("height", windowSize1)
			.attr("fill", "none")
			.attr("stroke", strokeColor)
			.attr("stroke-width", strokeWidth);
	}

	function windowLayer2(){
		// console.log(windowHeight2);
		win2.append("g:line")
			.attr("id", "upperLine_2Id")
			.attr("x1", 0)
			.attr("y1", rectHeight_2/2)
			.attr("x2", margin)
			.attr("y2", 0)
			.attr("stroke", strokeColor)
			.attr("stroke-width", strokeWidth);

		win2.append("g:line")
			.attr("id", "lowerLine_2Id")
			.attr("x1", 0)
			.attr("y1", rectHeight_2/2)
			.attr("x2", margin)
			.attr("y2", windowHeight2)
			.attr("stroke", strokeColor)
			.attr("stroke-width", strokeWidth);
	}

	function thirdLayer(secID){
		
		
		$.getJSON( "data/data.php", { section: secID} )
			.done(function( data ) {
				console.log(data);
				base = data.sectionText;
				processThirdLayerData(data);
				
				cleanThirdLayer();
				
				
				
				
				drawAlignChart(data);
				textDiv.append("pre")
					.style("font-family", sectionFontFamily)
					.style("font-size", sectionFontSize)
					.html(data.sectionText)
			});
		
		//TODO: still need to add axis labels
		function drawAlignChart(data) {
			var lengthScale = d3.scale.linear()
				.domain([0, data.sectionText.length])
				.range([0, alignChartHeight]);
			
			var srt = function(obj1, obj2) {
				return obj1.IntrDate - obj2.IntrDate;
			}
			
			var selectedInd = -1;
			
			data.matches.sort(srt);
			
			var minStart = data.sectionText.length;
			var maxEnd = -1;
			for (var i = 0; i < data.matches.length; i++) {
				minStart = Math.min(data.matches[i].docAstart, minStart);
				maxEnd = Math.max(data.matches[i].docAend, maxEnd);
			}
			minStart = Math.max(minStart - 10, 0);
			maxEnd = Math.min(maxEnd + 10, data.sectionText.length);
			
			if (data.matches.length == 0) {
				minStart = 0;
				maxEnd = data.sectionText.length;
			}
			
			var adjustedLengthScale = d3.scale.linear()
				.domain([minStart, maxEnd])
				.range([0, alignChartHeight]);
			
			var chart = comp.append("g")
				.attr("id", "alignChart")
				.attr("transform", "translate(" + 0 + "," + 0 + ")");
			
			chart.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("height", alignChartHeight)
				.attr("width", 2)
				.attr("fill", "black");
			
			var markMaxWidth = 10;
			var markMargin = 8;
			var markWidth = Math.min(markMaxWidth, (alignChartWidth - markMargin)/data.matches.length - markMargin);
		
			chart.selectAll("alignments")
				.data(data.matches)
				.enter()
					.append("rect")
					.attr("id", function(d,i) { return "alignment" + i; })
					.attr("class", "alignments")
					.attr("x", function(d, i) { return (alignChartWidth - (markWidth + markMargin)*data.matches.length)/2 + i*(markWidth + markMargin) + markMargin})
					.attr("y", function(d) { return lengthScale(d.docAstart); })
					.attr("height", function(d) { return lengthScale(d.docAend) - lengthScale(d.docAstart);})
					.attr("width", markWidth)
					.attr("stroke", "black")
					.attr("stroke-width", 1)
					//.attr("opacity", .5)
					.attr("fill", function(d) { return partyColor(d.Party); })
					.on("mouseover", function(d,i) { 
						d3.select(this)
							.attr("stroke-width", 2)
							.attr("fill", highlightColor);
					})
					.on("mouseout", function(d,i) { 
						if (i != selectedInd) {
							d3.select(this)
								.attr("stroke-width", 1)
								.attr("fill", function() { return partyColor(d.Party); });
						}
					})
					.on("click", function(d,i) { 
						var highlight = data.sectionText;
						highlight = highlight.slice(0,d.docAstart) + "<span style='background-color: " + highlightColor + "'>" + highlight.slice(d.docAstart,d.docAend) + "</span>" + highlight.slice(d.docAend);
						
						billInfoDiv.style("background-color", otherBillBackground);
						billTextDiv.style("background-color", otherBillBackground);
						
						d3.select("#alignment" + selectedInd)
							.attr("stroke-width", 1)
							.attr("fill", function() { return partyColor(data.matches[selectedInd].Party); });
		
						selectedInd = i;
						
						textDiv.select("pre")
							.html(highlight);
								
						cleanBillInfo();
						writeBillInfo(d);
					})
					.transition()
						.delay(2*transTime)
						.duration(transTime)
						//.attr("stroke-width", 2*markWidth)
						//.attr("d", function(d) { return "M" + (timeScale(d.IntrDate) + alignChartPadding) + "," + (alignChartPadding + alignChartHeight - adjustedLengthScale(parseInt(d.docAend))) + "L" + (timeScale(d.IntrDate) + alignChartPadding) + "," + (alignChartPadding + alignChartHeight - adjustedLengthScale(parseInt(d.docAstart)))})
						.attr("y", function(d) { return adjustedLengthScale(parseInt(d.docAstart)); })
						.attr("height", function(d) { return adjustedLengthScale(parseInt(d.docAend)) - adjustedLengthScale(parseInt(d.docAstart));})
						//.attr("width", 2*markWidth)
			
			var textHeight = 12;
			var curQ = -1;
			var curYear = -1;
			var lastBar = 0;
			
			if (data.matches.length > 0) {
				//add bars between alignments that separates them by quarters of the year
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
			
				//draw the last bar to handle the fencepost case
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
			}
			
			chart.append("path")
				.attr("d", "M0," + lengthScale(minStart) + " L" + alignChartWidth + "," + lengthScale(minStart))
				.attr("stroke-width", 1)
				.attr("stroke", "black")
				.transition()
					.delay(2*transTime)
					.duration(transTime)
					.attr("d", "M0," + adjustedLengthScale(minStart) + " L" + alignChartWidth + "," + adjustedLengthScale(minStart));
					
			if (data.matches.length > 0) {
				chart.append("text")
					.attr("x", alignChartWidth + 5)
					.attr("y", lengthScale(minStart) + textHeight/2)
					.text(Math.round(minStart/data.sectionText.length * 100) + "%")
					.transition()
						.delay(2*transTime)
						.duration(transTime)
						.attr("y", adjustedLengthScale(minStart) + textHeight/2);
			}
			
			//if (maxEnd < data.sectionText.length) {
				chart.append("path")
					.attr("d", "M0," + lengthScale(maxEnd) + " L" + alignChartWidth + "," + lengthScale(maxEnd))
					.attr("stroke-width", 2)
					.attr("stroke", "black")
					//.attr("stroke-dasharray", "10,10")
					.transition()
						.delay(2*transTime)
						.duration(transTime)
						.attr("d", "M0," + adjustedLengthScale(maxEnd) + " L" + alignChartWidth + "," + adjustedLengthScale(maxEnd));
						
				chart.append("text")
					.attr("x", alignChartWidth + 5)
					.attr("y", lengthScale(maxEnd) + textHeight/2)
					.text(Math.round(maxEnd/data.sectionText.length * 100) + "%")
					.transition()
						.delay(2*transTime)
						.duration(transTime)
						.attr("y", adjustedLengthScale(maxEnd) + textHeight/2);
			//}
			
			if (data.matches.length == 0) {
				chart.append("text")
					.attr("x", alignChartWidth/2)
					.attr("y", alignChartHeight/2)
					.attr("text-anchor", "middle")
					.attr("font-family", "Arial, Helvetica")
					.attr("opacity", .5)
					.attr("font-size", 30)
					.text("No Matches");
			}
			
		}
		
		function processThirdLayerData(data) {
			for (var i = 0; i < data.matches.length; i++) {
				
				text = data.sectionText;
				match = data.matches[i].textA;
				var baseInd = getMatchIndices(data.sectionText, data.matches[i].textA);
				text = data.matches[i].matchText;
				match = data.matches[i].textB;
				var otherInd = getMatchIndices(data.matches[i].matchText, data.matches[i].textB);
				
				data.matches[i].docAstart = baseInd[0];
				data.matches[i].docAend = baseInd[1];
				data.matches[i].docBstart = otherInd[0];
				data.matches[i].docBend = otherInd[1];
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
			.text("Introduced " + date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear());
		
		billInfoDiv.append("p")
			.attr("class", "BillInfo")
			.text("Author: " + d.NameFull + " (" + d.Postal + ")");
		
		var parties = {"100": "Democrat", "200": "Republican"};
		
		billInfoDiv.append("p")
			.attr("class", "BillInfo")
			.text("Party: " + parties[d.Party]);
		
		billInfoDiv.append("p")
			.attr("class", "BillInfo")
			.append("a")
				.attr("href", d.URL)
				.text("Full Text");
		
		var highlight = d.matchText;
		highlight = highlight.slice(0,d.docBstart) + "<span style='background-color: " + highlightColor + "'>" + highlight.slice(d.docBstart,d.docBend) + "</span>" + highlight.slice(d.docBend);
		
		billTextDiv.append("pre")
				.attr("class", "billText")
				.style("font-family", sectionFontFamily)
				.style("font-size", sectionFontSize)
				.html(highlight);
	}
	
	function cleanBillInfo() {
		billTextDiv.select(".billText").remove();
		billInfoDiv.selectAll(".BillInfo").remove();
	}
	
	function cleanFirstLayer(){
		svg.selectAll(".repRow_1").remove();
		svg.selectAll(".demRow_1").remove();
		svg.select("#firstLayerAxis").remove();
	}

	function cleanWindow1Layer(){
		win1.select("#upperLine_1Id").remove();
		win1.select("#lowerLine_1Id").remove();
		win1.select("#box_1Id").remove();
	}

	function cleanSecondLayer(){
		sec.selectAll(".rectRow_2").remove();
		sec.selectAll(".centralAxis").remove();
		sec.selectAll(".repRow_2").remove();
		sec.selectAll(".demRow_2").remove();
		sec.selectAll(".textGroup").remove();
		sec.selectAll(".axis_2").remove();
	}

	function cleanWindow2Layer(){
		win2.select("#upperLine_2Id").remove();
		win2.select("#lowerLine_2Id").remove();
	}

	function cleanThirdLayer(){
		comp.select("#alignChart").remove();
		textDiv.select("pre").remove();
		billInfoDiv.style("background-color", backgroundColor);
		billTextDiv.style("background-color", backgroundColor);
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

	function getMatchIndices(text, match) {
		var t = text.replace(/<DELETED>/g, "         ");
		t = t.replace(/<\/DELETED>/g, "          ");
		t = t.replace(/[\W|_]/g," ");
		t = t.toLowerCase();
		
		//console.log(t);
		
		var m = match.replace(/[\s-]/g,"");
		
		if (m.length > 600) {
			var mStart = m.substr(0,500);
			var mEnd = m.substr(m.length - 500,m.length);
			mStart = mStart.split("").join("\\s*");
			mEnd = mEnd.split("").join("\\s*");
			var matchExpStart = new RegExp(mStart, "g");
			var matchExpEnd = new RegExp(mEnd, "g");
		
			var start = t.search(matchExpStart);
			var end = t.search(matchExpEnd) + t.match(matchExpEnd)[0].length;
			return [start, end];
		} else {
			m = m.split("").join("\\s*");
			var matchExp = new RegExp(m, "g");
		
			//console.log(matchExp);
		
			var start = t.search(matchExp);
			var end = start + t.match(matchExp)[0].length;
			return [start, end];
		}
	}
	sortButton();
	firstLayer();
})();