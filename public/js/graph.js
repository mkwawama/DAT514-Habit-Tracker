//Function to Plot Chart
function plotBarChart(graphData){

    var myData = JSON.parse(graphData);
    var chart = new CanvasJS.Chart("chartContainer", {
      animationEnabled: true,
  
      title:{
        text:"Scores in the last 7 days"
      },
      axisX:{
        interval: 1
      },
      axisY2:{
        interlacedColor: "rgba(1,77,101,.2)",
        gridColor: "rgba(1,77,101,.1)",
        title: "Scores"
      },
      data: [{
        type: "bar",
        name: "",
        axisYType: "secondary",
        dataPoints: myData
      }]
    });
    chart.render();
  
  }
  