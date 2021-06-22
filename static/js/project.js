window.onload = function(){
  DropDownList();
  BarChart("consent_deaths");
  Line_Chart();
  US_Map();
  Pi_Chart();
  PCP();
}

var url = "http://127.0.0.1:5000"
var dimen = [];
var noOfBins = 10;
var global_feature;
var categorical = ["state",  "consent_cases", "consent_deaths", "submission_date", "created_at"]


function Line_Chart(){
  var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 1260 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#svg_id2")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("static/data/covid_us.csv",

  // When reading the csv, I must format variables:
  function(d){
    return {  date : d3.timeParse("%Y-%m-%d")(d.submission_date), value : d.tot_cases }
  },

  // Now I can use this dataset:
  function(data) {

    // Add X axis --> it is a date format
    var x = d3.scaleTime()
      .domain(d3.extent(data, function(d) { return d.date; }))
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.value; })])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add the line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.date) })
        .y(function(d) { return y(d.value) })
        )

})
}

function US_Map(){

}

function Pi_Chart(){

}

function PCP(){

}


function DropDownList(){
  d3.csv("static/data/covid_us.csv", function(error, data) {
      if (error)
        console.log("me aa gaya");
      var flag = 0;
      console.log(data);
      var already_selected;
      for (var key in data[0]) {
        var li = document.createElement("li");
        // area labelledby use to link label to the inputs
        li.setAttribute("aria-labelledby","listoffeatures");
        li.setAttribute("selected", true);
        var list_element = document.createElement("list_element")
        // to change the text in html whereever it is selected
        list_element.innerHTML = key;
        li.append(list_element);
        // adding as a child to select_drop_down
        document.getElementById("select_drop_down").appendChild(li);
        // to select a element which we will show in bar chart or Histogram
        if(flag == 0){
          already_selected = key;
        }
      }
      // select the element which listoffeatures
      $("#listoffeatures").text("select feature");
      $("#select_drop_down").children("li").click(function(){
        // console.log($(this).text());
        // $(this).addClass("active").siblings("li").removeClass("active");
        // to show the name in box after selecting the value
        // $("#listoffeatures").text($(this).text());
        // $(this).addClass("active").siblings("li").removeClass("active");
        if(jQuery.inArray( $(this).text(), categorical)   == -1){
          global_feature = $(this).text();
          Histogram($(this).text(), noOfBins);
        }
        else{
          global_feature = $(this).text();
          BarChart($(this).text());
        }
      })
  });
}

function BarChart(feature){
  console.log("barchart");
  console.log(feature);
  // to intialize d3 with black screen
  d3.select("svg").html("");
  var x_axis =[], y_axis = [];
  d3.csv("static/data/covid_us.csv", function(error, data){
    // error message incsase not able to load data
    if(error){
      console.log("Not able to load data");
    }
    console.log(data);
    var dict = {};
    // looping in the data
    for(let i=0; i<data.length; i++){

      if(data[i][feature] != "" && data[i][feature] in dict){
        dict[data[i][feature]]++;
      }
      else if(data[i][feature] != ""){
        dict[data[i][feature]] = 0;
      }
    }

    // adding into the list which we will use to plot barchart
    Object.keys(dict).forEach(function(key) {
      x_axis.push(key);
      y_axis.push(dict[key]);
    });
    console.log(x_axis);
    console.log(y_axis);

    // code for padding, width, heightm, maximum height
    var padding={top:50,right:50,bottom:50,left:200};
		var width = 1200;
		var height = 800;
		var maximumH = 700;


    // selecting the svg container and dimesions
    var svg = d3.select("svg").attr("width", width).attr("height", height).attr("transform", "translate("+padding.left+","+padding.top+")");
   //

   var paddingXScale = width - padding.left - padding.right;
   var paddingYScale = maximumH - padding.top - padding.bottom;
   var xscale = d3.scaleBand().rangeRound([0, paddingXScale]);
   var yscale = d3.scaleLinear().range([paddingYScale, 0]);

   xscale.domain(x_axis);
   yscale.domain([0, d3.max(y_axis)+15]);

   // var xaxis = d3.svg.axis().scale(xscale).orient("left");
   // code to setup axis for the bar chart
   var xaxis = d3.axisBottom().scale(xscale);
   svg.append("g").attr("class","axis").attr("transform", "translate(50,"+ paddingYScale +")").call(xaxis);
   var yaxis = d3.axisLeft().scale(yscale);
   svg.append("g").attr("class","axis").attr("transform", "translate(50,0)").call(yaxis);
   //
   // svg.append("g").attr("transform", "translate(50, 10)").call(y_axis);
   svg.append("text").attr("text-anchor", "middle").attr("transform", "translate("+ (17) +","+(maximumH/2)+")rotate(-90)").text(feature +" frequeency");
   svg.append("text").attr("text-anchor", "middle").attr("transform", "translate("+ (width/2 -100) +","+(maximumH-55)+")").text(feature);

   console.log("bandwidth - "+ xscale.bandwidth());
   svg.selectAll(".rect").data(y_axis).enter().append("rect").attr("class", "bar").attr("x", function(a,b){
     return xscale(x_axis[b])+60;
   }).attr("y", function(a){
     return yscale(a);
   }).attr("width", xscale.bandwidth() - 20).attr("height", function(a){
     return paddingYScale-yscale(a);
   }).attr("fill", "steelblue").on("mouseover", function(a,b){
     d3.select(this).attr("fill", "red")

     svg.append("text").text(a).attr("id","text_number").attr("x", xscale(x_axis[b])+ 75).attr("y",(yscale(a) - 90)).attr("dy",80).attr("text-anchor", "middle").attr("fill", "red")
   }).on("mouseout", function(a){
     d3.select(this).attr("fill", "steelblue");
     d3.select("#text_number").remove();
   })
  })
}

function Histogram(feature, num_of_bin){
  d3.select("svg").html("");
  // var num_of_bin = 10;
  var formatCount = d3.format(",.0f");
  var mainData = [];
  d3.csv("static/data/covid_us.csv",function(error,data){
    if(error){
        console.log(error);
    }

    // looping in the data
    for(let i=0; i<data.length; i++){
      var val = parseFloat(data[i][feature]);
      if(val != NaN){
        mainData.push(val);
      }
    }
	console.log(mainData);

	var padding={top:20,right:20,bottom:20,left:100};
	var width = 1160;
	var height = 760;
  var maximumH = 600;

  var paddingXScale = width - 200;
	var xscale =d3.scaleLinear().domain([d3.min(mainData),d3.max(mainData)]).range([0,paddingXScale])
	var histogram = d3.histogram().domain([d3.min(mainData),d3.max(mainData)]).thresholds(xscale.ticks(num_of_bin))

	var bins_data = histogram(mainData);
	console.log(bins_data);
	// console.log(data);
	var svg = d3.select("svg").attr("width",width + 40).attr("height",height+40)
	    .attr("transform","translate("+(padding.left*3)+","+padding.top+")")
	var yscale = d3.scaleLinear()
			.domain([0,d3.max(bins_data, function(d){return d.length})])
			.range([maximumH,0]);

  var xAxis = d3.axisBottom().scale(xscale).tickFormat(d3.format(".0f")).ticks(num_of_bin);
          // svg.append("g").attr("class","axis").attr("transform", "translate(50,"+ paddingYScale +")").call(xaxis);
  var yAxis = d3.axisLeft().scale(yscale);

  //draw x axis
	svg.append("g").attr("class","axis").attr("transform", "translate(50," + (maximumH+40) + ")").call(xAxis)

	//draw y axis
	svg.append("g").attr("class","axis").attr("transform", "translate(50,40)").call(yAxis)

	 //draw x axis text
	 svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate("+ (width/2 -80) +","+(maximumH+3*padding.top+15)+")")
 		.text(feature);

 	svg.append("text")
        .attr("text-anchor", "middle")
        .text(feature + " value")
        .attr("transform", "translate("+ (17) +","+(maximumH/2)+")rotate(-90)")


      var bar = svg.selectAll("rect")
      .data(bins_data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", 1)
      .attr("transform", function(d) {
		  return "translate(" + (xscale(d.x0) + 50)  + "," + (yscale(d.length) + 40) + ")"; })
      .attr("width", function(d) { return xscale(d.x1) - xscale(d.x0) -1 ; })
      .attr("height", function(d) { return maximumH - yscale(d.length); }).attr("fill","steelblue")
      .on("mouseover",function(d,i){
            d3.select(this)
            .attr("fill","red")

			           svg.append("text").attr("id","text_number")
                .attr("x", (xscale(d.x1)+xscale(d.x0))/2 + 50)
                .attr("y", yscale(d.length))
                .attr("dy", 20)
                .attr("text-anchor", "middle").text(d.length).attr("fill", "red")

        }).on("mouseout", function(a){
          d3.select(this).attr("fill", "steelblue");
          d3.select("#text_number").remove();
        })
      });

      d3.select("#svg_id").on("mousedown", function(){
        console.log("I am here");

        var div = d3.select(this).classed("active", true);
        var mouse_position = d3.mouse(div.node())[0];
    		var w = d3.select(window)
    			.on("mousemove", mousemove)
    			.on("mouseup", function(){
    				  // div.classed("active", false);
    		    	w.on("mousemove", null).on("mouseup", null);
    		 	});

    		function mousemove() {
    		  	if(d3.mouse(div.node())[0] + 10 < mouse_position && noOfBins > 4){
    		  		Histogram(global_feature, --noOfBins);
    		  		mouse_position = d3.mouse(div.node())[0];
    		  	}
    		    else if(d3.mouse(div.node())[0] - 10 > mouse_position && noOfBins < 25){
    		  		Histogram(global_feature, ++noOfBins);
    		  		mouse_position = d3.mouse(div.node())[0];
    		  	}
    		}
      })
    }
