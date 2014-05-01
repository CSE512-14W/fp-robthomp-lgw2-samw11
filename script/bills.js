(function() {
	/* <copyright file="bills.js">
	 * Copyright (c) 2014 All Right Reserved
	 *
	 * THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY 
	 * KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
	 * IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 	 * PARTICULAR PURPOSE.
	 * </copyright>
	 *
	 * <author>Robert Thompson</author>
	 * <email>robthomp@cs.washington.edu</email>
	 *
	 * <author>Lucy Williams</author>
	 * <email>lgw2@u.washington.edu</email>
	 *
	 * <author>Sam Wilson</author>
	 * <email>samw11@cs.washington.edu</email>
	 * <date>2014-03-21</date>
	 * <summary>Visualization for the Idea Tracer</summary>
	 */

	/* 
	 * This visualization consist of 9 different areas.
	 * 1) Title header (Idea Tracer)
	 * 2) "Sort by" buttons 
	 * 3) Explanation Text 
	 * 4) The most left hand side column (first layer)
	 * 5) The middle column with lots of rectangular boxes (second layer)
	 * 	  AND the right area (third layer) which consist of
	 * 6) The alignment chart
	 * 7) The original bill section in text form
	 * 8) The matching other bill section in text form
	 * 9) The details of the matching bill
	 */

	/***********************************************************************
	 ********variables that may need to be changed for other bills**********
	 ***********************************************************************/

	var billNameShort = "HR4380MTB";	// The bill name in the third layer, original bill section
	var explanationText = "This includes all links to this MTB above a certain threshold.";
	var explanationText2 = "Click and drag the view window in the overview or scroll to change the sections available for exploration. Click any available section to see an overview chart for that section's matches, dispalying the position within the base text and sponsor congressional group for each text matching. Select a matching pair to see the texts side by side, highlighted to indicate where the texts are the same and where they differ.";
	var maxMatchNum = 50; 	// the maximum matching number show in the boxes in the first and second layer

	/***********************************************************************
	 ***general settings, don't change unless you know what you are doing***
	 ***********************************************************************/
	var titleText = "Idea Tracer";

	// frame variables
    var height = 720, 		// the total hight of this visualization
		width = 1080,		// the total width of this visualization
		margin = 20,		// the margin between each layer of this visualization
		titleHeight = 40,	// the hight of the titleText (Idea Tracer)
		headerHeight = 70,	// the total hight of the header (from titleText to sortby boxes)
		bodyMargin = 6;		// the margin between this visualization and the browser edge

	// colors
	var Grey = d3.rgb(200,200,200),
		Yellow = d3.rgb(255,255,51),
		LightYellow = d3.rgb(255,255,187),
		republicanColor = "#fda4a7",
		democraticColor = "#99c0e5",
		independentColor = Grey,
		firstLayerCentralAxis = Grey,
		layerTwoBackgroundColor = Grey,
		whiteBackgroundColor = "white",
		strokeColor = "black",
		highlightColor = LightYellow,
		layerThreeBackgroundColor = Grey,
		otherBillBackground = "#eeeeee"
		clickedColor = Yellow,
		mismatchColor = "orange";

	// data in json format		
	var sectionData = [];

	var clickedId = 0,	// default setting, the first one is clicked
		isFirst = true; // is it first page load?

	// the top title layer variables
	var fontSize = 2*titleHeight / 3,
		fontFamily = "Arial,Helvetica";

	// sortBy button region
	var sortByWidth = 250,
		buttonWidth = 60,
		sortByHeight = 20,
		dataSortBy = [{name:"SecID", sort:"secID"}, {name:"Date", sort:"date"}, {name:"Match", sort:"matchNum"}],
		currSort = "SecID",
		clickedSortByBox = 0, 	// default settings sort by secID 
		opacityUnclickSortBy = 0.2,
		opacityClickSortBy = 0.5,
		textSizeAndBoxHeight = 2*sortByHeight/3;

	// first layer variables
	var rowMax = width / 30,	// the length of each row
		rowHeight,
		axisWidth = 1,		// the central axis width 
		firstLayerWidth = 2 * rowMax + axisWidth,
		firstLayerHeight = height - headerHeight - margin,
		darkbackground = "#eeeeee",
		highlight = Yellow,
		backgroundOpacity = 0.5;

	// the window layer between first and second layer
	var windowStart1 = d3.scale.linear(),
		windowSize1 = 0,
		strokeWidth = 1;

	// second layer variables
	var secondLayerWidth = width / 12,
		secondLayerHeight = height - headerHeight - margin,
		rectWidth_2 = secondLayerWidth * 0.9,
		rectHeight_2 = rectWidth_2 / 2;
		boundary = secondLayerWidth * 0.4;
		smallFont = 0,
		totalHeight = 0,
		axisWidth_2 = axisWidth * 2,
		clickedOpacitySecLayer = 0.5,
		unClickedOpacitySecLayer = 0.1,
		// dem and rep bar width
		scaleWidth = d3.scale.linear()
						.domain([0, rowMax])
						.range([0, rectWidth_2/2-axisWidth_2/2]),
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
		textDivWidth = (alignChartWidth + billInfoDivWidth + margin)/2 + 5,
		xPosition = firstLayerWidth + secondLayerWidth + boundary*2 + 2*margin,
		sectionFontFamily = "",
		sectionFontSize = "11px",
		assignmentHeight = 40;

	// transition time
	var transTime = 1000,
		extraDelay = 500;

	d3.select("body")
		.style("margin", "0px")
		.insert("svg:svg")
		.attr("width", width)
		.attr("height", height);

	var titleRegion = d3.select("svg");

	var explanationDiv = d3.select("body")
					.append("div")
					.attr("id", "explanationDiv")
					.style({
						"position": "absolute", 
						"top": 0 + "px", 
						"left": (width/4 + margin*2) + "px",
						"height": titleHeight + "px",
						"width": 3*width/4 + margin*2+ "px",
						"font-size": "10px"
						});
	
	explanationDiv.append("p")
			.text(explanationText);	
	
	explanationDiv.append("p")
			.text(explanationText2);			

	var svg = d3.select("svg")
				.append("g")
				.attr("id", "firstLayout")
				.attr("width", firstLayerWidth)
				.attr("height", firstLayerHeight)
				.attr("transform", "translate(" + margin + "," + (headerHeight + margin) + ")");

	var sec = d3.select("body")
					.append("div")
					.attr("id", "secLayerDivOutter")
					.style({
						"position": "absolute", 
						"top": (headerHeight + margin) + "px", 
						"left": (2*margin + firstLayerWidth) + "px",
						"height": secondLayerHeight + "px",
						"width": (secondLayerWidth + margin) + "px",
						"overflow": "hidden"})
					.append("div")
					.attr("id", "secLayerDiv")
					.style({
						"position": "absolute", 
						"height": secondLayerHeight + "px",
						"width": (secondLayerWidth + 2*margin) + "px",
						"overflow": "auto"})
					.append("svg:svg")
					.attr("width", secondLayerWidth)
					.style("overflow", "auto");

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
					.attr("id", "baseBillTextDiv")
					.style({
						"position": "absolute", 
						"top": (headerHeight + alignChartHeight + margin*2) + "px", 
						"left": (firstLayerWidth + secondLayerWidth + textDivWidth + margin*3 + 10) + "px",
						"height": (height - headerHeight - alignChartHeight - 2*margin) + "px",
						"width": textDivWidth + "px",
						"background-color": otherBillBackground,
						"padding": "5px",
						"overflow": "scroll"});
	
	textDiv.append("h2")
		.text(billNameShort + " Section");
	
	var billTextDiv = d3.select("body")
					.append("div")
					.attr("id", "matchingBillTextDiv")
					.style({
						"position": "absolute", 
						"top": (headerHeight + alignChartHeight + margin*2) + "px", 
						"left": (firstLayerWidth + secondLayerWidth + margin*2 + margin) + "px",
						"height": (height - headerHeight - alignChartHeight - 2*margin - assignmentHeight) + "px",
						"width": textDivWidth + "px",
						"padding": "5px",
						"overflow": "scroll"});
	
	var assignment = d3.select("body")
					.append("div")
					.style({
						"position": "absolute", 
						"top": (height - assignmentHeight + 15) + "px", 
						"left": (firstLayerWidth + secondLayerWidth + margin*3) + "px",
						"height": assignmentHeight + "px",
						"width": textDivWidth + "px"});
	
	assignment.html("Label this Comparison: <input id='field' type='text'><input id='submit' type='submit'>");
	
	billTextDiv.append("h2")
		.text("Matching Bill Section");
	
	var billInfoDiv = d3.select("body")
						.append("div")
						.style({
							"position": "absolute", 
							"top": (headerHeight + margin/2) + "px", 
							"left": (firstLayerWidth + secondLayerWidth + margin*5 + alignChartWidth) + "px",
							"height": alignChartHeight + margin + "px",
							"width": billInfoDivWidth + "px",
							"font-family": fontFamily,
							"padding": "5px",
							"overflow": "scroll"});

	var drag = d3.behavior.drag()
			    .on("drag", dragged);

	/*
	 * Sort data by key: secid, date or match
	 * @param array the secionData
	 * @param key the param that need to be sorted: either secid, date or match
	 * @param asec in ascending or descending order
	 */
	function sortData(array, key, asec){
		// update the click id
		var secId = array[clickedId].secID;
		// console.log("SortData secid and clicked id " + secId + " " + clickedId);
		// sort the data
		array.sort(function(a, b) {
			if (asec) {
				return a[key] > b[key] ? 1 : ((a[key] < b[key]) ? -1 : 0);
			} else {
				return a[key] > b[key] ? -1 : ((a[key] < b[key]) ? 1 : 0);
			}
		});
		// is this the first page load?
		if (isFirst) {
			return;
		}
		// at this point, user clicks the sort button. So we need to find the 
		// corresponding secid and update the clickedId
		for (var i = 0; i < array.length; i++){
			if (array[i].secID === secId) {
				// console.log("update secid and clicked id " + array[i].secID + " " + i);
				clickedId = i;
				return;
			}
		}
	}

	/*
	 * The window section between first and second layer
	 * move the scrolling bar to the proper position 
	 */
	function scrollPos(){
		var div = document.getElementById("secLayerDiv").scrollTop;
		var startPos = windowStart1(div);

		changeFirstLayerWindow(startPos);
		
		thirdLayerPointer(div);
	}

	/* 
	 * Call back function when user drag on the first layer
	 * @param d, the data
	 */
	function dragged(d) {
		var yPosition = d3.mouse(this)[1];
		yPosition = Math.min(Math.max(yPosition, 0), firstLayerHeight - windowSize1);

		changeFirstLayerWindow(yPosition);
	}

	/*
	 * adjust the window between first and second layer
	 * @param position, the offset of the window
	 */
	function changeFirstLayerWindow(position){
		// scroll to the proper section box in second layer
		var offsetVal = windowStart1.invert(position);
		 $("#secLayerDiv").scrollTop(offsetVal);
		thirdLayerPointer(offsetVal);
		// move the window between 1 and 2 layer
		d3.select("#box_1Id")
						.attr("y", position);

		d3.select("#top_box_1Id")
						.attr("height", position);

		d3.select("#buttom_box_1Id")
						.attr("y", position + windowSize1)
						.attr("height", firstLayerHeight - position - windowSize1);
		
		d3.select("#upperTri_1Id")
			.attr("d", "M0,0 L" + margin + ",0 L0," + position + "z");
		
		d3.select("#lowerTri_1Id")
			.attr("d", "M0," + (position + windowSize1) + " L" + margin + "," + secondLayerHeight + " L0," + secondLayerHeight + "z")

	}

	// the window arrow between 2nd and 3rd layer
	function thirdLayerPointer(div){
		
		var selectedBox = d3.select("#rectSecId"+clickedId)[0][0].y.animVal.value;
		
		var y = Math.min(Math.max(selectedBox - div, 0), secondLayerHeight - windowHeight2);

		if (y == 0){
			var ySquash = d3.scale.linear()
						.domain([totalHeight, 0]) // 27609
						.range([-rectHeight_2/2, 0]);
			y = ySquash(div);
		} else if (y == secondLayerHeight - windowHeight2) {
			var ySquash = d3.scale.linear()
						.domain([0, totalHeight])
						.range([secondLayerHeight - rectHeight_2/2, secondLayerHeight - rectHeight_2]);
			y = ySquash(div);
		} else if (isFirst) {
			// edge case, when the first page load, 
			// need to set y = 0 in order to point to the middle of the box
			y = 0;
		}

		// move the window between 2 and 3 layer
		d3.select("#upperLine_2Id")
			.attr("y1", y + rectHeight_2 / 2)
			.attr("y2", Math.max(y, 0));

		d3.select("#lowerLine_2Id")
			.attr("y1", y + rectHeight_2 / 2)
			.attr("y2", Math.min(y + rectHeight_2, secondLayerHeight));
	}

	/*
	 * Draw the sort buttons
	 */
	function sortButton(){
		// The title
		titleRegion.append("g")
					.append("text")
					.attr("id", "visTitle")
					.attr("x", margin)
					.attr("y", fontSize)
					.text(titleText)
					.attr("font-size", fontSize);

		// sort buttons border
		var sortRegion = titleRegion.append("g")
							.attr("transform", "translate(" + margin + "," + (titleHeight + 10) + ")");

		sortRegion.append("rect")
					.attr("id", "sortRegionID")
					.attr("x", 0)
					.attr("y", 0)
					.attr("width", sortByWidth)
					.attr("height", sortByHeight)
					.attr("fill", whiteBackgroundColor)
					.attr("stroke", strokeColor)
					.style("opacity", 0.1);

		// Sort by text
		sortRegion.append("text")
					.attr("id", "sortBytextID")
					.attr("class", "sortText")
					.attr("x", 5)
					.attr("y", textSizeAndBoxHeight)
					.text("Sort by:")
					.attr("font-size", textSizeAndBoxHeight);

		// button text: secID, Date and Match
		sortRegion.selectAll("sortText")
					.data(dataSortBy)
					.enter()
					.append("text")
					.attr("class", "sortText")
					.attr("id", function (d, i) { return "sortByTextId" + i; })
					.attr("x", function (d, i) { return sortByWidth - (dataSortBy.length - i)*buttonWidth + buttonWidth/2; })
					.attr("y", textSizeAndBoxHeight)
					.attr("text-anchor", "middle")
					.text(function (d) { return d.name; })	
					.attr("font-size", textSizeAndBoxHeight);

		// the sorted button
		sortRegion.selectAll("sortedButton")
					.data(dataSortBy)
					.enter()
					.append("rect")
					.attr("id", function (d, i) { return "sortBoxID" + i; })
					.attr("class", "sortedButton")
					.attr("x", function (d, i) { return sortByWidth - (dataSortBy.length - i)*buttonWidth; })
					.attr("y", 0)
					.attr("width", buttonWidth)
					.attr("height", sortByHeight)
					.attr("fill", whiteBackgroundColor)
					.attr("stroke", strokeColor)
					.style("opacity", opacityUnclickSortBy)
					.on("mouseover", function (d, i) { d3.select("#sortBoxID" + i).attr("fill", clickedColor); })
					.on("mouseleave", function (d, i) { if (i != clickedSortByBox) d3.select("#sortBoxID" + i).attr("fill", whiteBackgroundColor); })
					.on("click", rearrange);

		// Default setting: sort by the secId 
		d3.select("#sortBoxID" + clickedSortByBox)
			.attr("fill", clickedColor)
			.style("opacity", opacityClickSortBy)
	}

	/*
	 * Rearrange the data order base on the sorting
	 * @param d the sectionData
	 * @param i the sort button index
	 */
	function rearrange (d, i) {
		// reset all the color to un-click
		d3.selectAll("#sortBoxID" + clickedSortByBox)
			.attr("fill", whiteBackgroundColor)
			.style("opacity", opacityUnclickSortBy);

		// update the sort button index
		clickedSortByBox = i;

		// fill color on the clicked box
		d3.select("#sortBoxID" + clickedSortByBox)
			.attr("fill", clickedColor)
			.style("opacity", opacityClickSortBy);

		var sortBy = d.name;
		
		if (currSort === sortBy) {
			// it's the same, no need to resort
			return;
		} 
		currSort = sortBy;
		// sort the data
		if (sortBy === "Sec ID"){
			// right now, only secID is sorted in ascending order
			sortData(sectionData, d.sort, "asec");
		} else {
			sortData(sectionData, d.sort);
		}
		// redraw everything starting from the first layer
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
						});
						// start drawing the visualization
			 			controlFlow_1();
					});
		} else {
			// need to clean up
			cleanFirstLayer();
			cleanWindow1Layer();
			controlFlow_1();
		}

		function controlFlow_1(){
			rowHeight = firstLayerHeight/sectionData.length;
			// sort by secID
			if (isFirst) {
				sortData(sectionData, "secID", "asec");
			} 
			
			draw_1(rowHeight);
			// direct to second layer
			toSecondLayer();
		}

		function draw_1(rowHeight){

			//the central axis
 			svg.append("rect")
 				.attr("id", "firstLayerAxis")
 				.attr("width", axisWidth)
				.attr("height", rowHeight * sectionData.length)
				.attr("x", rowMax)
				.attr("y", 0)
				.attr("fill", firstLayerCentralAxis);
 			
 			// the republican row (right hand side)
 			svg.selectAll("repRow_1")
				.data(sectionData)
				.enter()
				.append("rect")
				.attr("id", function(d, i) { return "repRow_1Id" + i; })
				.attr("class", "repRow_1")
				.attr("width", function(d) { return Math.min(d["s200"] + d["hr200"], maxMatchNum) * rowMax / maxMatchNum; })
				.attr("height", rowHeight)
				.attr("x", function(d, i) { return rowMax + axisWidth; })
				.attr("y", function(d, i) { return i*rowHeight; })
				.attr("fill", republicanColor);
				
			// the democratic row (left hand side)
			svg.selectAll("demRow_1")
				.data(sectionData)
				.enter()
				.append("rect")
				.attr("id", function(d, i) { return "demRow_1Id" + i; })
				.attr("class", "demRow_1")
				.attr("width", function(d) { return Math.min(d["s100"] + d["hr100"], maxMatchNum) * rowMax / maxMatchNum; })
				.attr("height", rowHeight)
				.attr("x", function(d, i) { return rowMax - (Math.min(d["s100"] + d["hr100"], maxMatchNum) * rowMax / maxMatchNum); })
				.attr("y", function(d, i) { return i*rowHeight; })
				.attr("fill", democraticColor);
		}

		/*
		 * Initialize the second layer
		 */
		function toSecondLayer(){
			secondLayer(sectionData);
		}

		// end of the first layer
	}
	
	// Logic of the second layer
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
			// console.log("totalHeight" + totalHeight);
			sec.attr("height", totalHeight);
			windowSize1 = secondLayerHeight / (rectHeight_2 + margin) * rowHeight;
			windowStart1.domain([0, totalHeight])
						.range([0, secondLayerHeight]);
			// the pos is the section box offset at the top of the view
			var pos = scrollUp();
			
			windowLayer1(windowStart1(pos));
			windowLayer2();
			if (isFirst) {
				// go to the third layer if this is the first page load
				// clickedId should be zero by default
				toThirdLayer(data[clickedId], clickedId);
				// done the page load, change the flag
				isFirst = false; 
			}
		}

		/*
		 * Draw all the small boxes including axis, row for republican 
		 * and democratic as the text in the second layer
		 */
    	function draw_2(){
    		// republican row (right hand side)
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
				.duration(transTime + extraDelay)
				.attr("width", function(d) { return scaleWidth(Math.min(d["s200"] + d["hr200"], maxMatchNum) * rowMax / maxMatchNum); })
				.attr("height", rectHeight_2)
				.attr("x", function(d, i) { return rectWidth_2 / 2 + axisWidth / 2; })
				.attr("y", function(d, i) { return i*(rectHeight_2+margin); })
				.attr("fill", republicanColor);
			
			// democratic row (left hand side)
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
				.duration(transTime + extraDelay)
				.attr("width", function(d) { return scaleWidth(Math.min(d["s100"] + d["hr100"], maxMatchNum) * rowMax / maxMatchNum); })
				.attr("height", rectHeight_2)
				.attr("x", function(d, i) { return rectWidth_2 / 2 - axisWidth_2 / 2 - scaleWidth(Math.min(d["s100"] + d["hr100"], maxMatchNum) * rowMax / maxMatchNum) ; })
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
				.style("opacity", unClickedOpacitySecLayer)
 				.transition()
				.duration(transTime + extraDelay)
 				.attr("width", axisWidth_2)
				.attr("height", rectHeight_2)
				.attr("x", rectWidth_2 / 2 - axisWidth_2 / 2)
				.attr("y", function(d, i) { return i*(rectHeight_2+margin); })
				.attr("fill", firstLayerCentralAxis)
				.style("opacity", 1);
			
			// show text, either secID, date or match number
			sec.append("g").selectAll("textGroup")
				.data(data)
				.enter()
				.append("g:text")
				.attr("id", function(d, i) { return "textId" + i; })
				.attr("class", "textGroup")
				.attr("x", rectWidth_2/2)
				.attr("y", function(d, i) { return (i)*(rectHeight_2+margin) + rectHeight_2/2; })
				.text(currentSort)
				.attr("font-size", smallFont)
				.attr("text-anchor", "middle")
				.attr("font-family", fontFamily)
				.style("opacity", unClickedOpacitySecLayer)
				.transition()
				.duration(transTime)
				.attr("x", rectWidth_2/2)//function(d, i) { return (rectSize_2/2) + boundary + 2*margin + firstLayerWidth; })
				.attr("y", function(d, i) { return (i)*(rectHeight_2+margin) + 2*rectHeight_2/3; })
				.attr("font-size", function (d) { return d.matchNum == 0 && (currSort === "Date" || currSort === "Match") ? rectHeight_2/3 : rectHeight_2/2; })
				.style("opacity", 1);	

			sec.append("g").selectAll("rectRow_2")
				.data(data)
				.enter()
				.append("g:rect")
				.attr("id", function(d, i) { return "rectSecId" + i; })
				.attr("class", "rectRow_2")
				.attr("width", 1)
				.attr("height", 1)
				.attr("x", rectWidth_2/2)
				.attr("y", function(d, i) { return rectHeight_2/2 + i*(rectHeight_2+margin); })
				.attr("fill", whiteBackgroundColor)
				.attr("stroke", strokeColor)
				.style("opacity", function(d, i) { return i == clickedId ? clickedOpacitySecLayer : unClickedOpacitySecLayer; })
				.on("mouseover", showTip)
				.on("mouseleave", hideTip)
				.on("click", toThirdLayer)
				.transition()
				.duration(transTime)
				.attr("width", rectWidth_2)
				.attr("height", rectHeight_2)
				.attr("x", 0)
				.attr("y", function(d, i) { return i*(rectHeight_2+margin); })
				.attr("fill", function(d, i) { return i == clickedId ? highlight : whiteBackgroundColor; })
				.attr("stroke", strokeColor);
    	}

    	/*
    	 * Get the correct text detail for the section box
    	 * @param d the sectionData
    	 * @return the string text of the section box
    	 */
    	function currentSort(d) {
    		if (currSort === "SecID"){
    			return d.secID;
    		} else if (currSort === "Date") {
    			if (d.matchNum == 0) {
    				// no match, so don't show the date
    				return "No Matches";
    			}
    			var date = d.date;
    			return (date.getMonth() + 1) + "-" + date.getDate() + "-" + (date.getFullYear() + "").substr(2);
    		} else if (currSort === "Match") {
    			return d.matchNum > 0 ? d.matchNum : "No Matches";
    		} else {
    			return "N/A"; // should not happen
    		}
    	}

    	/*
    	 * Scroll the clicked box at the top view
    	 * @return the offset value of the section box
    	 */
    	function scrollUp(){
    		var clickedSec = $("#rectSecId"+clickedId),
    			offsetVal = clickedSec.parent().scrollTop() + clickedSec.offset().top - clickedSec.parent().offset().top;
    		$("#secLayerDiv").animate({
    			scrollTop: offsetVal
    		});
    		return offsetVal;
    	}

    	/*
    	 * Call back function when mouseover the section box in second layer
    	 * @param d the sectionData
    	 * @param i the index of the current data
    	 */
		function showTip(d, i){
			// highlight the republican row in the first layer
			svg.select("#repRow_1Id"+i)
				.attr("fill", highlight);
			// highlight the democratic row in the first layer
			svg.select("#demRow_1Id"+i)
				.attr("fill", highlight);
			// highlight the rect in the second layer
			sec.select("#rectSecId"+i)
				.attr("fill", highlight);
		}

		/*
		 * Call back function when mouseleave the section box in the second layer
		 * @param d the sectionData
    	 * @param i the index of the current data
		 */
		function hideTip(d, i){
			// check if this box has already been highlighted or not
			if (i != clickedId) {
			// change back the republican row in the first layer	
			svg.select("#repRow_1Id"+i)
				.attr("fill", republicanColor);
			// change back the democratic row in the first layer	
			svg.select("#demRow_1Id"+i)
				.attr("fill", democraticColor);
			// change back the rect in the second layer
			sec.select("#rectSecId"+i)
				.attr("fill", whiteBackgroundColor);
			}
		}
		
		function toThirdLayer(d, i){
			if (!isFirst && i == clickedId) {
				// this is the current section box, don't do anything
				return;
			}
			// cancel the previous one
			d3.select("#rectSecId" + clickedId)
				.attr("fill", whiteBackgroundColor)
				.style("opacity", unClickedOpacitySecLayer);

			d3.select("#repRow_1Id" + clickedId)
				.attr("fill", republicanColor);

			d3.select("#demRow_1Id" + clickedId)
				.attr("fill", democraticColor);

			// update the clicked id
			clickedId = i;

			var yPosition = d3.select("#rectSecId"+clickedId)[0][0].y.animVal.value;
			if (isFirst) {
				// edge case for the first load.
				// need to adjust the position
				yPosition = 0;
			}
			// clear all the loading image if any
			d3.selectAll(".loadingImageClass").remove();
			// add a loading picture
			sec.append("g:image")
				.attr("id", "loadingImageId")
				.attr("class", "loadingImageClass")
				.attr("xlink:href", "./image/loading.gif")
				.attr("width", rectHeight_2)
				.attr("height", rectHeight_2)
				.attr("x", rectHeight_2/2)
				.attr("y", yPosition);

			// change the clicked one
			d3.select("#rectSecId" + clickedId)
				.style("opacity", clickedOpacitySecLayer);

			var div = document.getElementById("secLayerDiv").scrollTop;
			thirdLayerPointer(div);

			console.log("sec id: " + d.secID, "Clicked id: " + clickedId);
			thirdLayer(d.secID);
		}

		controlFlow_2();
		// end of second layer
	}

	// draw the window between first and second layer
	function windowLayer1(yPos){
		
		win1.append("g:path")
			.attr("id", "upperTri_1Id")
			.attr("d", "M0,0 L" + margin + ",0 L0," + yPos + "z")
			.attr("opacity", backgroundOpacity)
			.attr("fill", darkbackground);
		
		win1.append("g:path")
			.attr("id", "lowerTri_1Id")
			.attr("d", "M0," + (yPos + windowSize1) + " L" + margin + "," + secondLayerHeight + " L0," + secondLayerHeight + "z")
			.attr("opacity", backgroundOpacity)
			.attr("fill", darkbackground);

		win1.append("g:rect")
			.attr("id", "top_box_1Id")
			.attr("x", -firstLayerWidth)
			.attr("y", 0)
			.attr("width", firstLayerWidth)
			.attr("height", yPos)
			.attr("fill", darkbackground)
			.attr("opacity", backgroundOpacity)
			.on("click", function() { changeFirstLayerWindow(d3.mouse(this)[1]); });

		win1.append("g:rect")
			.attr("id", "box_1Id")
			.attr("x", -firstLayerWidth)
			.attr("y", yPos)
			.attr("width", firstLayerWidth)
			.attr("height", windowSize1)
			.attr("fill", "white")
			.attr("stroke", strokeColor)
			.attr("stroke-width", 0)
			.style("opacity", 0.1)
			.call(drag);

		win1.append("g:rect")
			.attr("id", "buttom_box_1Id")
			.attr("x", -firstLayerWidth)
			.attr("y", yPos + windowSize1)
			.attr("width", firstLayerWidth)
			.attr("height", firstLayerHeight - yPos - windowSize1)
			.attr("fill", darkbackground)
			.attr("opacity", backgroundOpacity)
			.on("click", function() { changeFirstLayerWindow(d3.mouse(this)[1]); });

		// end of the window layer 1
	}

	// draw the window layer 2 between second and third layer
	function windowLayer2(){
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

		// end of the window layer 2
	}

	/*
	 * logic of the third layer
	 * @param secID, the section id that user clicked in the second layer
	 */
	function thirdLayer(secID){
		//clean whatever was in the third layer already
		cleanThirdLayer();
		
		//get data based on sectionID from the server
		$.getJSON( "data/data.php", { section: secID} )
			.done(function( data ) {
				cleanThirdLayer();
				//console.log(data);
				base = data.sectionText;
				processThirdLayerData(data);
				
				drawAlignChart(data);
				textDiv.append("pre")
					.style("font-family", sectionFontFamily)
					.style("font-size", sectionFontSize)
					.html(data.sectionText)
				
				textDiv.select("h2")
					.text("Base Bill - Section " + secID);
				
				d3.selectAll(".loadingImageClass").remove();
			});
		
		/*
		 * Draw the alignment chart with axis, labels, and bars
		 * @param data an array of matches
		 */
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
			var markMargin = 4;
			var markWidth = Math.max(1, Math.min(markMaxWidth, (alignChartWidth - markMargin)/data.matches.length - markMargin));
		
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
				.attr("stroke", function(d) { return partyColor(d.Party); })
				.attr("stroke-width", 2)
				.attr("fill", function(d) { return d.BillType == "S" ? partyColor(d.Party) : "none" })
				.attr("background-image", 'image/dem.png')
				.on("mouseover", function(d,i) { 
					d3.select(this)
						.attr("fill", highlightColor)
						.attr("stroke", highlightColor);
				})
				.on("mouseout", function(d,i) { 
					if (i != selectedInd) {
						d3.select(this)
							.attr("fill", function(d) { return d.BillType == "S" ? partyColor(d.Party) : "none" ; })
							.attr("stroke", function(d) { return partyColor(d.Party); });
					}
				})
				
				.on("click", function(d,i) { 
					cleanBillInfo();
					if (data.matches[selectedInd]) {
						d3.select("#alignment" + selectedInd)
							.attr("stroke-width", 1)
							.attr("stroke", partyColor(data.matches[selectedInd].Party))
							.attr("fill", data.matches[selectedInd].BillType == "S" ? partyColor(data.matches[selectedInd].Party) : whiteBackgroundColor);
					}
				
					selectedInd = i;
						
					assignment.style("display", "block");
					assignment.select("#submit")
						.on("click", function() {
							$.getJSON( "data/assign.php", { comp: d.compID, label: d3.select("#field")[0][0].value } );
							d3.select("#field")[0][0].value = "";
						});	
							
					
					writeBillInfo(d, data.sectionText);
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
				chart.append("text")
					.attr("x", 2)
					.attr("y", -3)
					.attr("font-size", 12)
					.text("Section Matches")
				
				chart.append("text")
					.attr("x", 3*alignChartWidth/4 + 70)
					.attr("y", -3)
					.attr("font-size", 10)
					.text("House Bill: ");
				
				chart.append("rect")
					.attr("x", 3*alignChartWidth/4 + 120)
					.attr("y", -12)
					.attr("height", 10)
					.attr("width", 10)
					.attr("fill", "none")
					.attr("stroke", independentColor);
					
				chart.append("text")
					.attr("x", 3*alignChartWidth/4)
					.attr("y", -3)
					.attr("font-size", 10)
					.text("Senate Bill: ");
				
				chart.append("rect")
					.attr("x", 3*alignChartWidth/4 + 50)
					.attr("y", -12)
					.attr("height", 10)
					.attr("width", 10)
					.attr("fill", independentColor)
					.attr("stroke", independentColor);
				
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
				
				chart.append("path")
					.attr("d", "M0," + lengthScale(minStart) + " L" + alignChartWidth + "," + lengthScale(minStart))
					.attr("stroke-width", 1)
					.attr("stroke", "black")
					.transition()
					.delay(2*transTime)
					.duration(transTime)
					.attr("d", "M0," + adjustedLengthScale(minStart) + " L" + alignChartWidth + "," + adjustedLengthScale(minStart));
					
				chart.append("text")
					.attr("x", alignChartWidth + 5)
					.attr("y", lengthScale(minStart) + textHeight/2)
					.text("Start")
					.transition()
					.delay(2*transTime)
					.duration(transTime)
					.attr("y", adjustedLengthScale(minStart) + textHeight/2);
			
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
					.text("End")
					.transition()
					.delay(2*transTime)
					.duration(transTime)
					.attr("y", adjustedLengthScale(maxEnd) + textHeight/2);
			} else {
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
		
		/*
		 * Takes data from the server and calculates the proper text alignment locations
		 * @param data the initial response from the server
		 */
		function processThirdLayerData(data) {
			for (var i = 0; i < data.matches.length; i++) {
				
				text = data.sectionText;
				match = data.matches[i].textA;
				textA = data.matches[i].textA;
				textB = data.matches[i].textB;
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

		// end of the third layer
	}

	/*
	 * Write bill info to the bill info window and show highlighted text
	 * @param d matching data
	 * @param baseText the formatted text that corresponds to the d matching
	 */
	function writeBillInfo(d, baseText) {
		
		var highlightString = makeHighlightHTML(baseText, d.docAstart, d.docAend, d.textA, d.textB);
		
		var highlight = baseText;
		highlight = highlight.slice(0,d.docAstart) + "<span style='background-color: " + highlightColor + "'>" + /*highlight.slice(d.docAstart,d.docAend)*/highlightString + "</span>" + highlight.slice(d.docAend);
		
		textDiv.select("pre")
			.html(highlight);
		
		$("#baseBillTextDiv").scrollTop($("#baseBillTextDiv pre").height() * d.docAstart/baseText.length + 68);
		
		billInfoDiv.style("background-color", partyColor(d.Party));
		billTextDiv.style("background-color", partyColor(d.Party));
		
		billInfoDiv.append("h1")
			.attr("class", "BillInfo")
			.text(d.BillType + d.BillNum)
		
		var date = new Date(d.IntrDate * 1000);
		
		billInfoDiv.append("p")
			.attr("class", "BillInfo")
			.text("Introduced: " + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear());
		
		billInfoDiv.append("p")
			.attr("class", "BillInfo")
			.text("Sponsor: " + (d.NameFull ? (d.NameFull + " (" + d.Postal + ")") : "Unknown"));
		
		var parties = {"100": "Democrat", "200": "Republican", "328": "Independent"};
		var groups  = {"S": "Senate", "HR": "House"};
		
		billInfoDiv.append("p")
			.attr("class", "BillInfo")
			.text("Party: " + parties[d.Party]);
		
		billInfoDiv.append("p")
			.attr("class", "BillInfo")
			.text("Became Law: " + (d.PLaw == "0" ? "No" : "Yes"));
		
		billTextDiv.select("h2").text(groups[d.BillType] + " Bill " + d.BillNum + " - Section " + d.matchingSectionID);
		
		billInfoDiv.append("p")
			.attr("class", "BillInfo")
			.append("a")
				.attr("href", d.URL)
				.attr("target", "_blank")
				.text("Full Text");
		
		var highlightString = makeHighlightHTML(d.matchText, d.docBstart, d.docBend, d.textB, d.textA);
		var highlight = d.matchText;
		highlight = highlight.slice(0,d.docBstart) + "<span style='background-color: " + highlightColor + "'>" + /*highlight.slice(d.docBstart,d.docBend)*/highlightString + "</span>" + highlight.slice(d.docBend);
		
		billTextDiv.append("pre")
				.attr("class", "billText")
				.style("font-family", sectionFontFamily)
				.style("font-size", sectionFontSize)
				.html(highlight);
		
		$("#matchingBillTextDiv").scrollTop($("#matchingBillTextDiv pre").height() * d.docBstart/d.matchText.length + 68);
	}
	
	/*
	 * Remove bill info elements from screen
	 */
	function cleanBillInfo() {
		billTextDiv.select(".billText").remove();
		billInfoDiv.selectAll(".BillInfo").remove();
		
		assignment.style("display", "none");
		assignment.select("#submit")
			.on("click", null);
	}
	
	function cleanFirstLayer(){
		svg.selectAll(".repRow_1").remove();
		svg.selectAll(".demRow_1").remove();
		svg.select("#firstLayerAxis").remove();
	}

	function cleanWindow1Layer(){
		win1.select("#box_1Id").remove();
		win1.select("#top_box_1Id").remove();
		win1.select("#upperTri_1Id").remove();
		win1.select("#lowerTri_1Id").remove();
		win1.select("#buttom_box_1Id").remove();
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
		textDiv.select("h2")
			.text("");
		billInfoDiv.style("background-color", whiteBackgroundColor);
		billTextDiv.style("background-color", whiteBackgroundColor);
		billTextDiv.select("h2")
			.text("Matching Bill Section");
		cleanBillInfo();
	}

	/*
	 * Get the correct color base on the party
	 * @param data the sectionData
	 * @return the proper color 
	 */
	function partyColor(party) {
		if (party == "200") {
			return republicanColor;
		} else if (party == "100") {
			return democraticColor;
		} else {
			return independentColor;
		}
	}

	/*
	 * Takes a text and a matching string and locates where the matching is within the text
	 * @param text the original text
	 * @param match the matching string
	 */
	function getMatchIndices(text, match) {
		t = text.replace(/<DELETED>/g, "         ");
		t = t.replace(/<\/DELETED>/g, "          ");
		t = t.replace(/<plus-minus>/g, "            ");
		t = t.replace(/[\W|_]/g," ");
		t = t.toLowerCase();
		
		var m = match.replace(/[\s-]/g,"");
		m = m.replace(/\\/g,"");
		
		if (m.length > 600) {
			var mStart = m.substr(0,500);
			var mEnd = m.substr(m.length - 500,m.length);
			mStart = mStart.split("").join("\\s*");
			mStart = afterDotOptional(mStart);
			mEnd = mEnd.split("").join("\\s*");
			mEnd = afterDotOptional(mEnd);
			var matchExpStart = new RegExp(mStart, "g");
			var matchExpEnd = new RegExp(mEnd, "g");
		
			var start = t.search(matchExpStart);
			var end = t.search(matchExpEnd) + t.match(matchExpEnd)[0].length;
			return [start, end];
		} else {
			m = m.split("").join("\\s*");
			m = afterDotOptional(m);
			var matchExp = new RegExp(m, "g");
		
			//console.log(matchExp);
		
			var start = t.search(matchExp);
			var end = start + t.match(matchExp)[0].length;
			return [start, end];
		}
	}
	
	/*
	 * Takes a regex string and tries to fix all the known errors from the text comparison output
	 * @param str the original regex
	 */
	function afterDotOptional(str) {
		ind = str.indexOf("0\\s*1\\s*p\\s*e\\s*r\\s*c\\s*e\\s*n\\s*t\\s*o\\s*f\\s*z\\s*i\\s*n\\s*c");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("1\\s*d\\s*e\\s*c\\s*i\\s*t\\s*e\\s*x");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("2\\s*d\\s*e\\s*c\\s*i\\s*t\\s*e\\s*x\\s*p\\s*e\\s*r\\s*f\\s*i\\s*l\\s*a\\s*m\\s*e\\s*n\\s*t");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("l\\s*i\\s*t\\s*e\\s*r\\s*s\\s*p\\s*r\\s*o\\s*v\\s*i\\s*d\\s*e\\s*d\\s*f\\s*o\\s*r");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("0\\s*5\\s*m\\s*i\\s*c\\s*r\\s*o\\s*n\\s*s\\s*a\\s*n\\s*d\\s*w\\s*i\\s*t\\s*h");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("1\\s*5\\s*m\\s*i\\s*c\\s*r\\s*o\\s*n\\s*s\\s*d\\s*i\\s*a\\s*m\\s*e\\s*t\\s*e\\s*r");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("1\\s*5\\s*m\\s*i\\s*c\\s*r\\s*o\\s*n\\s*s\\s*w\\s*h\\s*i\\s*c\\s*h\\s*r\\s*e\\s*t\\s*a\\s*i\\s*n");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("1\\s*5\\s*m\\s*i\\s*c\\s*r\\s*o\\s*n\\s*s\\s*o\\s*r\\s*l\\s*e\\s*s\\s*s");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("5\\s*9\\s*m\\s*m\\s*t\\s*o\\s*3\\s*5");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("m\\s*m\\s*p\\s*r\\s*o\\s*v\\s*i\\s*d\\s*e\\s*d\\s*f\\s*o\\s*r");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("c\\s*m\\s*o\\s*r\\s*m\\s*o\\s*r\\s*e\\s*i\\s*n\\s*d\\s*i\\s*a\\s*m\\s*e\\s*t\\s*e\\s*r");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("4\\s*0\\s*m\\s*m\\s*o\\s*r\\s*m\\s*o\\s*r\\s*e\\s*b\\s*u\\s*t");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("6\\s*5\\s*m\\s*m\\s*i\\s*n\\s*t\\s*h\\s*i\\s*c\\s*k\\s*n\\s*e\\s*s\\s*s\\s*p\\s*r\\s*e\\s*d");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("0\\s*7\\s*5\\s*m\\s*m\\s*t\\s*o\\s*1\\s*5\\s*0");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("1\\s*5\\s*0\\s*m\\s*m\\s*d\\s*r\\s*i\\s*e\\s*d\\s*t\\s*o\\s*a\\s*m\\s*o\\s*i\\s*s\\s*t");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("1\\s*a\\s*n\\s*d\\s*i\\s*n\\s*s\\s*e\\s*r\\s*t\\s*i\\s*n\\s*g\\s*f\\s*r\\s*e\\s*e\\s*a\\s*n\\s*d\\s*c\\s*b\\s*y\\s*s\\s*t\\s*r\\s*i\\s*k\\s*i\\s*n\\s*g");
		if (ind != -1) {
			str = str.substr(0,ind-3) + "?\\s*1\\s*5?" + str.substr(ind+1,str.length);
			ind = -1;
		}
		ind = str.indexOf("1\\s*a\\s*n\\s*d\\s*i\\s*n\\s*s\\s*e\\s*r\\s*t\\s*i\\s*n\\s*g\\s*f\\s*r\\s*e\\s*e\\s*a\\s*n\\s*d\\s*3\\s*b\\s*y\\s*s\\s*t\\s*r\\s*i\\s*k\\s*i\\s*n\\s*g");
		if (ind != -1) {
			str = str.substr(0,ind-3) + "?\\s*4?\\s*1\\s*5?" + str.substr(ind+1,str.length);
			ind = -1;
		}
		ind = str.indexOf("9\\s*9\\s*p\\s*e\\s*r\\s*c\\s*e\\s*n\\s*t\\s*9\\s*h\\s*e\\s*a\\s*d\\s*i\\s*n\\s*g");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("9\\s*9\\s*p\\s*e\\s*r\\s*c\\s*e\\s*n\\s*t\\s*a\\s*i\\s*n\\s*g\\s*e\\s*n\\s*e\\s*r\\s*a\\s*l");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("i\\s*n\\s*t\\s*h\\s*e\\s*c\\s*o\\s*l\\s*u\\s*m\\s*n\\s*1\\s*g\\s*e\\s*n\\s*e\\s*r\\s*a\\s*l\\s*r\\s*a\\s*t\\s*e\\s*o\\s*f");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("a\\s*n\\s*d\\s*i\\s*n\\s*s\\s*e\\s*r\\s*t\\s*i\\s*n\\s*g\\s*1\\s*3\\s*3\\s*4\\s*a\\s*n\\s*d\\s*2");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("64andbbystrikingthedate".split("").join("\\s*"));
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("inthecolumn1generalrateofdutycolumnandinserting1334".split("").join("\\s*"));
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("a\\s*n\\s*d\\s*b\\s*b\\s*y\\s*s\\s*t\\s*r\\s*i\\s*k\\s*i\\s*n\\s*g");
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("64and2bystriking12312009".split("").join("\\s*"));
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("certainacelectricmotorsofanoutputexceeding74".split("").join("\\s*"));
		if (ind != -1) {
			str = str.substr(0,ind + "certainacelectricmotorsofanoutputexceeding74".split("").join("\\s*").length) + "\\s*\\d?" + str.substr(ind + "certainacelectricmotorsofanoutputexceeding74".split("").join("\\s*").length, str.length);
			ind = -1;
		}
		ind = str.indexOf("25percentagepoints".split("").join("\\s*"));
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		ind = str.indexOf("75percentagepoints".split("").join("\\s*"));
		if (ind != -1) {
			str = str.substr(0,ind) + "\\d?\\s*" + str.substr(ind,str.length);
			ind = -1;
		}
		return str;
	}
	
	/*
	 * Makes an html highlight string within a text that shows matching string location and 
	 * where in that string the matching differed
	 * @param baseText the original formatted section text
	 * @param docAstart the character location where the match string starts
	 * @param docAend the character location where the match string ends
	 * @param textA the string matching from the baseText
	 * @param textB the string matching from the other text (not included here)
	 */
	function makeHighlightHTML(baseText, docAstart, docAend, textA, textB) {
		var highlightString = "";
		
		var t = baseText.replace(/<DELETED>/g, "         ");
		t = t.replace(/<\/DELETED>/g, "          ");
		t = t.replace(/[\W|_]/g," ");
		t = t.toLowerCase();
		
		var lastMismatched = false;
		var mInd = 0;
		var bInd = docAstart;
		while (mInd < textA.length && bInd < docAend) {
			//skip gaps in the textA match
			if (textA[mInd] == '-') {
				mInd++;
			} else if (t[bInd] == '\\') {
				bInd++;
			//skip extra characters in the original text (likely stripped out punctuation)
			} else if (textA[mInd] != t[bInd]) {
				highlightString = highlightString + baseText[bInd];
				bInd++;
			//we got a mismatch
			} else if (textB[mInd] == '-' || textA[mInd] != textB[mInd]) {
				if (!lastMismatched) {
					highlightString = highlightString + "<span style='background-color: " + mismatchColor + "'>";
				}
				highlightString = highlightString + baseText[bInd];
				mInd++;
				bInd++;
				lastMismatched = true;
			//the characters matched
			} else {
				if (lastMismatched) {
					highlightString = highlightString + "</span>";
				}
				highlightString = highlightString + baseText[bInd];
				mInd++;
				bInd++;
				lastMismatched = false;
			}
		}
		
		return highlightString;
	}
	// create the sortby button
	sortButton();
	// start from the first layer
	firstLayer();
})();
