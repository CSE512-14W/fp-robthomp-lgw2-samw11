(function() {

    var height = 720,
		width = 900;
		margin = 20;

	// color 
	var layerOneBackgroundColor = "green",
		republicanColor = "red",
		democraticColor = "blue",
		noMatch = "grey"
		rectBound = "black";

	var svg = d3.select("body").append("svg")
		   	.attr("width", width)
	    	.attr("height", height)
	  		.append("g");
	  		
	function firstLayer(){
		var republicData = [],
			democratData = [],
			noMatchData = [];
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
			//initVar(data);
			drawRect();
			//drawLegend();
			//bindData(data);
		}

		function drawRect(){
			var rectSize = 10;
			// background rect
			svg.append("rect")
				.attr("width", width / 5)
				.attr("height", height / 2)
				.attr("x", margin)
				.attr("y", margin)
				.attr("fill", layerOneBackgroundColor);

			svg.selectAll("republican")
				.data(republicData)
				.enter()
				.append("rect")
				.attr("id", function(d, i) { return "republicId" + i; })
				.attr("class", "republician")
				.attr("width", rectSize)
				.attr("height", rectSize)
				.attr("x", function(d, i) { console.log(d.secId);return margin + rectSize*i; })
				.attr("y", function(d, i) { return margin*3 ; })
				.attr("fill", republicanColor)
				.attr("stroke", rectBound);

		}

	}
	
	firstLayer();
})();