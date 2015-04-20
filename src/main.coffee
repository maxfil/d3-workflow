width = 1100
height = 600
font_size = 12
nodeSelected = null
workflow = null

rect_w = 70
rect_h = 40
k = rect_w/rect_h
edge_len = 90

color = d3.scale.category20()
force = d3.layout.force()
  .charge(-500)
  .linkDistance(edge_len)
  .size([width, height])

openWorkflow = (graph) ->
  d3.select("#board svg").remove()
  svg = d3.select("#board").append("svg")
    .attr("width", width)
    .attr("height", height)
  workflow = graph
  force.nodes(graph.nodes).links(graph.edges).start()

  svg.append("defs").append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 10)
    .attr("refY", 0)
    .attr("markerWidth", 5)
    .attr("markerHeight", 5)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")

  link = svg.selectAll(".link")
  .data(graph.edges)
  .enter().append("line")
  .attr("class", (d) ->
    if (!!d.dashed)
      "link dashed"
    else
      "link")
  .attr("marker-end", "url(#arrow)")

  group = svg.selectAll("g")
  .data(graph.nodes)
  .enter().append("g")
  .attr("class", (d) ->
    if (d.type == "circle")
      "node circle"
    else
      "node")
  .attr("id", (d) -> "node" + d.index)
  .call(force.drag)

  rect = group.append("rect")
    .attr("class", "rect")
    .attr("width", rect_w)
    .attr("height", rect_h)

  ellipse = group.append("ellipse")
  .attr("class", "ellipse")
  .attr("rx", (d) ->
    if (d.type == "circle")
      rect_h/2
    else
      rect_w/2-5)
  .attr("ry", (d) ->
    if (d.type == "circle")
      rect_h/2
    else
      rect_h/2-2)

  text = group.append("text")
  .text((d) -> return d.name)

  force.on("tick", () ->
    link.attr("x1", (d) -> d.source.x+rect_w/2)
    .attr("y1", (d) -> d.source.y+rect_h/2)
    .attr("x2", (d) ->
      x1 = d.source.x
      x2 = d.target.x
      y1 = d.source.y
      y2 = d.target.y
      if Math.abs(x1-x2) >= Math.abs(y1-y2)*k
        x2+rect_w/2+Math.sign(x1-x2)*rect_w/2
      else
        x2+rect_w/2+rect_h/2/Math.abs(y1-y2)*(x1-x2)
    )
    .attr("y2", (d) ->
      x1 = d.source.x
      x2 = d.target.x
      y1 = d.source.y
      y2 = d.target.y
      if Math.abs(x1-x2) <= Math.abs(y1-y2)*k
        y2+rect_h/2+Math.sign(y1-y2)*rect_h/2
      else
        y2+rect_h/2+rect_w/2/Math.abs(x1-x2)*(y1-y2)
    )

    ellipse.attr("cx", (d) -> d.x+rect_w/2)
    .attr("cy", (d) -> d.y+rect_h/2)

    rect.attr("x", (d) -> d.x)
    .attr("y", (d) -> d.y)

    text.attr("x", (d) -> d.x+17)
    .attr("y", (d) -> d.y+24)
  )
  svg.selectAll(".node").on("click", (d) ->
    nodeSelected = d.index
    task = graph.tasks[d.index]
    $("#nodeTitle").val(d.name)
    $("#taskName").val(task.name)
    $("#taskMetaData").val(JSON.stringify(task.json, null, 2))
  )
  $("#nodeTitle").on("input", () ->
    $("#node"+nodeSelected).find("text").text($(this).val())
    graph.nodes[nodeSelected].name = $(this).val()
  )
  $("#taskName").on("input", () ->
    graph.tasks[nodeSelected].name = $(this).val()
  )
  $("#taskMetaData").on("input", () ->
    graph.tasks[nodeSelected].json = JSON.parse($(this).val())
  )
  $("#addnode").click ->
    nodeName = prompt("Please enter node name", "")

loadFile = () ->
  input = $("#uploadfile")[0]
  file = input.files[0]
  fr = new FileReader()
  fr.onload = (e) ->
    lines = e.target.result
    newWorkflow = JSON.parse(lines)
    openWorkflow(newWorkflow)
  fr.readAsText(file)

$(document).ready(() ->
  $("#loadbtn").click ->
    $("#uploadfile").click()
  $("#uploadfile").change(() ->
    loadFile()
  )
  $("#savebtn").click ->
    blob = new Blob([JSON.stringify(workflow)], {type: "application/json;charset=utf-8"});
    saveAs(blob, "workflow.json");
)

d3.json("files/workflow.json", (error, graph) ->
  openWorkflow(graph)
)

#graph = new wGraph('#board')