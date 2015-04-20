var color, edge_len, font_size, force, height, k, loadFile, nodeSelected, openWorkflow, rect_h, rect_w, width, workflow;

width = 1100;

height = 600;

font_size = 12;

nodeSelected = null;

workflow = null;

rect_w = 70;

rect_h = 40;

k = rect_w / rect_h;

edge_len = 90;

color = d3.scale.category20();

force = d3.layout.force().charge(-500).linkDistance(edge_len).size([width, height]);

openWorkflow = function(graph) {
  var ellipse, group, link, rect, svg, text;
  d3.select("#board svg").remove();
  svg = d3.select("#board").append("svg").attr("width", width).attr("height", height);
  workflow = graph;
  force.nodes(graph.nodes).links(graph.edges).start();
  svg.append("defs").append("marker").attr("id", "arrow").attr("viewBox", "0 -5 10 10").attr("refX", 10).attr("refY", 0).attr("markerWidth", 5).attr("markerHeight", 5).attr("orient", "auto").append("path").attr("d", "M0,-5L10,0L0,5");
  link = svg.selectAll(".link").data(graph.edges).enter().append("line").attr("class", function(d) {
    if (!!d.dashed) {
      return "link dashed";
    } else {
      return "link";
    }
  }).attr("marker-end", "url(#arrow)");
  group = svg.selectAll("g").data(graph.nodes).enter().append("g").attr("class", function(d) {
    if (d.type === "circle") {
      return "node circle";
    } else {
      return "node";
    }
  }).attr("id", function(d) {
    return "node" + d.index;
  }).call(force.drag);
  rect = group.append("rect").attr("class", "rect").attr("width", rect_w).attr("height", rect_h);
  ellipse = group.append("ellipse").attr("class", "ellipse").attr("rx", function(d) {
    if (d.type === "circle") {
      return rect_h / 2;
    } else {
      return rect_w / 2 - 5;
    }
  }).attr("ry", function(d) {
    if (d.type === "circle") {
      return rect_h / 2;
    } else {
      return rect_h / 2 - 2;
    }
  });
  text = group.append("text").text(function(d) {
    return d.name;
  });
  force.on("tick", function() {
    link.attr("x1", function(d) {
      return d.source.x + rect_w / 2;
    }).attr("y1", function(d) {
      return d.source.y + rect_h / 2;
    }).attr("x2", function(d) {
      var x1, x2, y1, y2;
      x1 = d.source.x;
      x2 = d.target.x;
      y1 = d.source.y;
      y2 = d.target.y;
      if (Math.abs(x1 - x2) >= Math.abs(y1 - y2) * k) {
        return x2 + rect_w / 2 + Math.sign(x1 - x2) * rect_w / 2;
      } else {
        return x2 + rect_w / 2 + rect_h / 2 / Math.abs(y1 - y2) * (x1 - x2);
      }
    }).attr("y2", function(d) {
      var x1, x2, y1, y2;
      x1 = d.source.x;
      x2 = d.target.x;
      y1 = d.source.y;
      y2 = d.target.y;
      if (Math.abs(x1 - x2) <= Math.abs(y1 - y2) * k) {
        return y2 + rect_h / 2 + Math.sign(y1 - y2) * rect_h / 2;
      } else {
        return y2 + rect_h / 2 + rect_w / 2 / Math.abs(x1 - x2) * (y1 - y2);
      }
    });
    ellipse.attr("cx", function(d) {
      return d.x + rect_w / 2;
    }).attr("cy", function(d) {
      return d.y + rect_h / 2;
    });
    rect.attr("x", function(d) {
      return d.x;
    }).attr("y", function(d) {
      return d.y;
    });
    return text.attr("x", function(d) {
      return d.x + 17;
    }).attr("y", function(d) {
      return d.y + 24;
    });
  });
  svg.selectAll(".node").on("click", function(d) {
    var task;
    nodeSelected = d.index;
    task = graph.tasks[d.index];
    $("#nodeTitle").val(d.name);
    $("#taskName").val(task.name);
    return $("#taskMetaData").val(JSON.stringify(task.json, null, 2));
  });
  $("#nodeTitle").on("input", function() {
    $("#node" + nodeSelected).find("text").text($(this).val());
    return graph.nodes[nodeSelected].name = $(this).val();
  });
  $("#taskName").on("input", function() {
    return graph.tasks[nodeSelected].name = $(this).val();
  });
  $("#taskMetaData").on("input", function() {
    return graph.tasks[nodeSelected].json = JSON.parse($(this).val());
  });
  return $("#addnode").click(function() {
    var nodeName;
    return nodeName = prompt("Please enter node name", "");
  });
};

loadFile = function() {
  var file, fr, input;
  input = $("#uploadfile")[0];
  file = input.files[0];
  fr = new FileReader();
  fr.onload = function(e) {
    var lines, newWorkflow;
    lines = e.target.result;
    newWorkflow = JSON.parse(lines);
    return openWorkflow(newWorkflow);
  };
  return fr.readAsText(file);
};

$(document).ready(function() {
  $("#loadbtn").click(function() {
    return $("#uploadfile").click();
  });
  $("#uploadfile").change(function() {
    return loadFile();
  });
  return $("#savebtn").click(function() {
    var blob;
    blob = new Blob([JSON.stringify(workflow)], {
      type: "application/json;charset=utf-8"
    });
    return saveAs(blob, "workflow.json");
  });
});

d3.json("files/workflow.json", function(error, graph) {
  return openWorkflow(graph);
});
