var graph, loadFile, nodeSelected, openWorkflow, selectNode, workflow;

nodeSelected = null;

workflow = null;

openWorkflow = function(w) {
  var i, j, k, len, len1, link, node, ref, ref1, results;
  workflow = w;
  graph.clean();
  ref = w.nodes;
  for (i = j = 0, len = ref.length; j < len; i = ++j) {
    node = ref[i];
    graph.addNode(i, node.name, node["class"], node.x, node.y);
  }
  ref1 = w.links;
  results = [];
  for (k = 0, len1 = ref1.length; k < len1; k++) {
    link = ref1[k];
    results.push(graph.addLink(link.source, link.target, link["class"]));
  }
  return results;
};

loadFile = function() {
  var file, fr, input;
  input = $('#uploadfile')[0];
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

selectNode = function(id) {
  var node, task;
  nodeSelected = id;
  node = workflow.nodes[id];
  task = workflow.tasks[id];
  $('#nodeTitle').val(node.name);
  $('#taskName').val(task.name);
  return $('#taskMetaData').val(JSON.stringify(task.json, null, 2));
};

$(document).ready(function() {
  $('#loadbtn').click(function() {
    return $('#uploadfile').click();
  });
  $('#uploadfile').change(function() {
    return loadFile();
  });
  $('#savebtn').click(function() {
    var blob;
    blob = new Blob([JSON.stringify(workflow)], {
      type: 'application/json;charset=utf-8'
    });
    return saveAs(blob, 'workflow.json');
  });
  $('#nodeTitle').on('input', function() {
    $('#node' + nodeSelected).find('text').text($(this).val());
    return workflow.nodes[nodeSelected].name = $(this).val();
  });
  $('#taskName').on('input', function() {
    return workflow.tasks[nodeSelected].name = $(this).val();
  });
  $('#taskMetaData').on('input', function() {
    return workflow.tasks[nodeSelected].json = JSON.parse($(this).val());
  });
  $('#addnode').click(function() {
    var id, nodeName;
    nodeName = prompt('Please enter node name', '');
    id = workflow.nodes.length;
    graph.addNode(id, nodeName);
    workflow.nodes.push({
      'name': nodeName
    });
    return workflow.tasks.push({
      'name': nodeName,
      'node_id': id
    });
  });
  return $('#addlink').click(function() {
    var sourceId, targetId;
    sourceId = parseInt(prompt('Please enter source id', ''));
    targetId = parseInt(prompt('Please enter target id', ''));
    graph.addLink(sourceId, targetId);
    return workflow.links.push({
      'source': sourceId,
      'target': targetId
    });
  });
});

$.getJSON('files/peak-detection.json', function(json) {
  return openWorkflow(json);
});

graph = new wGraph('#board');
