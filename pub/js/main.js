var addingLink, graph, linkSelected, loadFile, node1, node2, nodeLink, nodeSelected, openWorkflow, selectLink, selectNode, showTasks, taskLink, taskSelected, tgraph, workflow;

nodeSelected = null;

taskSelected = null;

linkSelected = null;

workflow = null;

addingLink = false;

node1 = null;

node2 = null;

nodeLink = false;

taskLink = false;

openWorkflow = function(w) {
  var i, j, len, len1, link, node, ref, ref1;
  workflow = w;
  graph.clean();
  ref = w.nodes;
  for (i = 0, len = ref.length; i < len; i++) {
    node = ref[i];
    graph.addNode(node);
  }
  ref1 = w.links;
  for (j = 0, len1 = ref1.length; j < len1; j++) {
    link = ref1[j];
    graph.addLink(link);
  }
};

showTasks = function(nodeId) {
  var i, j, len, len1, link, ref, ref1, task;
  tgraph.clean();
  ref = workflow.tasks;
  for (i = 0, len = ref.length; i < len; i++) {
    task = ref[i];
    if (parseInt(task.nodeId) === nodeId) {
      tgraph.addNode(task);
    }
  }
  ref1 = workflow.taskLinks;
  for (j = 0, len1 = ref1.length; j < len1; j++) {
    link = ref1[j];
    tgraph.addLink(link);
  }
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

selectLink = function(id) {
  var link, newclass, oldclass;
  $('#nodeBoard').addClass('hide');
  $('#linkBoard').removeClass('hide');
  if (!isNaN(parseInt(nodeSelected))) {
    oldclass = $('#board').find('.node' + nodeSelected).attr('class');
    if (!!oldclass) {
      newclass = oldclass.replace('selected', '');
      $('#board').find('.node' + nodeSelected).attr('class', newclass);
    }
  }
  nodeSelected = null;
  if (!isNaN(parseInt(linkSelected))) {
    oldclass = $('#board').find('.link' + linkSelected).attr('class');
    if (!!oldclass) {
      newclass = oldclass.replace('selected', '');
      $('#board').find('.link' + linkSelected).attr('class', newclass);
    }
  }
  linkSelected = id;
  oldclass = $('#board').find('.link' + linkSelected).attr('class');
  $('#board').find('.link' + linkSelected).attr('class', oldclass + ' selected');
  link = workflow.links[id];
  return $('#linkMetaData').val(JSON.stringify(link.analysis, null, 2));
};

selectNode = function(id, type) {
  var link, newclass, node, oldclass, task;
  $('#linkBoard').addClass('hide');
  $('#nodeBoard').removeClass('hide');
  if (!isNaN(parseInt(linkSelected))) {
    oldclass = $('#board').find('.link' + linkSelected).attr('class');
    if (!!oldclass) {
      newclass = oldclass.replace('selected', '');
      $('#board').find('.link' + linkSelected).attr('class', newclass);
    }
  }
  linkSelected = null;
  if (type === 'task') {
    if (!isNaN(parseInt(taskSelected))) {
      oldclass = $('#tasksBoard').find('.node' + taskSelected).attr('class');
      if (!!oldclass) {
        newclass = oldclass.replace('selected', '');
        $('#tasksBoard').find('.node' + taskSelected).attr('class', newclass);
      }
    }
    taskSelected = id;
    oldclass = $('#tasksBoard').find('.node' + taskSelected).attr('class');
    $('#tasksBoard').find('.node' + taskSelected).attr('class', oldclass + ' selected');
    task = workflow.tasks[id];
    $('#taskName').val(task.name);
    $('#taskMetaData').val(JSON.stringify(task.json, null, 2));
    if (addingLink) {
      if (nodeLink || isNaN(parseInt(node1))) {
        taskLink = true;
        nodeLink = false;
        node1 = taskSelected;
        node2 = null;
      }
      if (!isNaN(parseInt(node1)) && isNaN(parseInt(node2)) && node1 !== taskSelected) {
        node2 = taskSelected;
        link = {
          'sourceId': node1,
          'targetId': node2,
          'id': graph.links.length
        };
        tgraph.addLink(link);
        workflow.taskLinks.push(link);
      }
      if (!isNaN(parseInt(node1)) && !isNaN(parseInt(node2)) && node2 !== taskSelected) {
        node1 = node2;
        node2 = taskSelected;
        link = {
          'sourceId': node1,
          'targetId': node2,
          'id': graph.links.length
        };
        tgraph.addLink(link);
        return workflow.taskLinks.push(link);
      }
    }
  } else {
    if (!isNaN(parseInt(nodeSelected))) {
      oldclass = $('#board').find('.node' + nodeSelected).attr('class');
      if (!!oldclass) {
        newclass = oldclass.replace('selected', '');
        $('#board').find('.node' + nodeSelected).attr('class', newclass);
      }
    }
    nodeSelected = id;
    oldclass = $('#board').find('.node' + nodeSelected).attr('class');
    $('#board').find('.node' + nodeSelected).attr('class', oldclass + ' selected');
    node = workflow.nodes[id];
    showTasks(id);
    $('#nodeTitle').val(node.name);
    if (addingLink) {
      if (taskLink || isNaN(parseInt(node1))) {
        taskLink = false;
        nodeLink = true;
        node1 = nodeSelected;
        node2 = null;
      }
      if (!isNaN(parseInt(node1)) && isNaN(parseInt(node2)) && node1 !== nodeSelected) {
        node2 = nodeSelected;
        link = {
          'sourceId': node1,
          'targetId': node2,
          'id': graph.links.length
        };
        graph.addLink(link);
        workflow.links.push(link);
      }
      if (!isNaN(parseInt(node1)) && !isNaN(parseInt(node2)) && node2 !== nodeSelected) {
        node1 = node2;
        node2 = nodeSelected;
        link = {
          'sourceId': node1,
          'targetId': node2,
          'id': graph.links.length
        };
        graph.addLink(link);
        return workflow.links.push(link);
      }
    }
  }
};

$(document).ready(function() {
  $('#loadbtn').click(function() {
    return $('#uploadfile').click();
  });
  $('#uploadfile').change(function() {
    return loadFile();
  });
  $('#savebtn').click(function() {
    var blob, sw;
    sw = {
      'nodes': graph.nodes,
      'links': graph.links,
      'tasks': tgraph.nodes,
      'taskLinks': tgraph.links
    };
    blob = new Blob([JSON.stringify(sw)], {
      type: 'application/json;charset=utf-8'
    });
    return saveAs(blob, 'workflow.json');
  });
  $('#nodeTitle').on('input', function() {
    $('#board').find('.node' + nodeSelected).find('text').text($(this).val());
    return workflow.nodes[nodeSelected].name = $(this).val();
  });
  $('#taskName').on('input', function() {
    $('#tasksBoard').find('.node' + taskSelected).find('text').text($(this).val());
    return workflow.tasks[taskSelected].name = $(this).val();
  });
  $('#taskMetaData').on('input', function() {
    return workflow.tasks[taskSelected].json = JSON.parse($(this).val());
  });
  $('#addnode').click(function() {
    var node, nodeId, nodeName, task, taskId;
    nodeName = prompt('Please enter node name', '');
    nodeId = workflow.nodes.length;
    taskId = workflow.tasks.length;
    node = {
      'id': nodeId,
      'name': nodeName
    };
    graph.addNode(node);
    workflow.nodes.push(node);
    task = {
      'id': taskId,
      'name': nodeName,
      'nodeId': nodeId,
      'class': 'circle',
      'json': {}
    };
    return workflow.tasks.push(task);
  });
  $('#addlink').click(function() {
    addingLink = !addingLink;
    $('#addlink').toggleClass('active');
    node1 = null;
    return node2 = null;
  });
  $('#addtask').click(function() {
    var nodeName, task, taskId;
    nodeName = prompt('Please enter task name', '');
    taskId = workflow.tasks.length;
    task = {
      'id': taskId,
      'name': nodeName,
      'nodeId': nodeSelected,
      'class': 'circle',
      'json': {}
    };
    tgraph.addNode(task);
    return workflow.tasks.push(task);
  });
  $('#library').click(function() {
    return $('#libraryOperators').toggleClass('hide');
  });
  $('#filterJoin').click(function() {
    var task, taskId;
    $('#libraryOperators').toggleClass('hide');
    taskId = workflow.tasks.length;
    task = {
      'id': taskId,
      'name': 'Filter Join',
      'nodeId': nodeSelected,
      'class': 'circle',
      'json': {
        'constraints': {
          'input': {
            'number': 2
          },
          'input0': {
            'type': 'SQL'
          },
          'input1': {
            'type': 'SQL'
          },
          'output': {
            'number': 1
          },
          'output0': {
            'type': 'SQL'
          },
          'opSpecification': {
            'algorithm': {
              'name': 'SQL_query'
            },
            'SQL_query': 'SELECT NATIONKEY, TOTALPRICE FROM $1 LEFT JOIN $2 ON $1.CUSTKEY=$2.CUSTKEY'
          }
        }
      }
    };
    tgraph.addNode(task);
    return workflow.tasks.push(task);
  });
  $('#groupBySort').click(function() {
    var task, taskId;
    $('#libraryOperators').toggleClass('hide');
    taskId = workflow.tasks.length;
    task = {
      'id': taskId,
      'name': 'groupBy Sort',
      'nodeId': nodeSelected,
      'class': 'circle',
      'json': {
        'constraints': {
          'input': {
            'number': 1
          },
          'input0': {
            'type': 'SQL'
          },
          'output': {
            'number': 1
          },
          'output0': {
            'type': 'SQL'
          },
          'opSpecification': {
            'algorithm': {
              'name': 'SQL_query'
            },
            'SQL_query': 'SELECT NATIONKEY, SUM(TOTALPRICE) AS SUM FROM $1 GROUP BY NATIONKEY ORDER BY SUM'
          }
        }
      }
    };
    tgraph.addNode(task);
    return workflow.tasks.push(task);
  });
  $('#PeakDetection').click(function() {
    var task, taskId;
    $('#libraryOperators').toggleClass('hide');
    taskId = workflow.tasks.length;
    task = {
      'id': taskId,
      'name': 'PeakDetection',
      'nodeId': nodeSelected,
      'class': 'circle',
      'json': {
        'constraints': {
          'input': {
            'number': 1
          },
          'output': {
            'number': 1
          },
          'opSpecification': {
            'algorithm': {
              'name': 'PeakDetection'
            }
          }
        }
      }
    };
    tgraph.addNode(task);
    return workflow.tasks.push(task);
  });
  $('#tfIdf').click(function() {
    var task, taskId;
    $('#libraryOperators').toggleClass('hide');
    taskId = workflow.tasks.length;
    task = {
      'id': taskId,
      'name': 'Tf-Idf',
      'nodeId': nodeSelected,
      'class': 'circle',
      'json': {
        'constraints': {
          'input': {
            'number': 1
          },
          'output': {
            'number': 1
          },
          'opSpecification': {
            'algorithm': {
              'name': 'TF_IDF'
            }
          }
        }
      }
    };
    tgraph.addNode(task);
    return workflow.tasks.push(task);
  });
  $('#kMeans').click(function() {
    var task, taskId;
    $('#libraryOperators').toggleClass('hide');
    taskId = workflow.tasks.length;
    task = {
      'id': taskId,
      'name': 'k-Means',
      'nodeId': nodeSelected,
      'class': 'circle',
      'json': {
        'constraints': {
          'input': {
            'number': 1
          },
          'output': {
            'number': 1
          },
          'opSpecification': {
            'algorithm': {
              'name': 'k-means'
            }
          }
        }
      }
    };
    tgraph.addNode(task);
    return workflow.tasks.push(task);
  });
  $('#analyse').click(function() {
    return $.ajax('/php/index.php', {
      data: {
        action: 'analyse',
        workflow: {
          'nodes': workflow.nodes,
          'links': workflow.links,
          'tasks': workflow.tasks,
          'taskLinks': workflow.taskLinks || []
        }
      },
      type: 'POST',
      success: function(data, textStatus, jqXHR) {
        var newWorkflow;
        newWorkflow = JSON.parse(data);
        return openWorkflow(newWorkflow);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        return console.log(textStatus);
      }
    });
  });
  return $('#optimise').click(function() {
    return $.ajax('/php/index.php', {
      data: {
        action: 'optimise',
        workflow: {
          'nodes': workflow.nodes,
          'links': workflow.links,
          'tasks': workflow.tasks,
          'taskLinks': workflow.taskLinks || []
        }
      },
      type: 'POST',
      success: function(data, textStatus, jqXHR) {
        var newWorkflow;
        newWorkflow = JSON.parse(data);
        return openWorkflow(newWorkflow);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        return console.log(textStatus);
      }
    });
  });
});

$.getJSON('files/workflow.json', function(json) {
  return openWorkflow(json);
});

graph = new wGraph('#board');

tgraph = new wGraph('#tasksBoard');
