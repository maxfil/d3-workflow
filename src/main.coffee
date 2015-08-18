nodeSelected = null
taskSelected = null
linkSelected = null
workflow = null
addingLink = false
node1 = null
node2 = null
nodeLink = false
taskLink = false

openWorkflow = (w) ->
  workflow = w
  graph.clean()
  for node in w.nodes
    graph.addNode(node)
  for link in w.links
    graph.addLink(link)
  return

showTasks = (nodeId) ->
  tgraph.clean()
  for task in workflow.tasks
    if parseInt(task.nodeId) == nodeId
      tgraph.addNode(task)
  for link in workflow.taskLinks
    tgraph.addLink(link)
  return

loadFile = ->
  input = $('#uploadfile')[0]
  file = input.files[0]
  fr = new FileReader()
  fr.onload = (e) ->
    lines = e.target.result
    newWorkflow = JSON.parse(lines)
    openWorkflow(newWorkflow)
  fr.readAsText(file)

selectLink = (id) ->
  $('#nodeBoard').addClass('hide')
  $('#linkBoard').removeClass('hide')
  if (!isNaN(parseInt(nodeSelected)))
    oldclass = $('#board').find('.node'+nodeSelected).attr('class')
    if !!oldclass
      newclass = oldclass.replace('selected', '');
      $('#board').find('.node'+nodeSelected).attr('class', newclass)
  nodeSelected = null
  if (!isNaN(parseInt(linkSelected)))
    oldclass = $('#board').find('.link'+linkSelected).attr('class')
    if !!oldclass
      newclass = oldclass.replace('selected', '');
      $('#board').find('.link'+linkSelected).attr('class', newclass)
  linkSelected = id
  oldclass = $('#board').find('.link'+linkSelected).attr('class')
  $('#board').find('.link'+linkSelected).attr('class', oldclass+' selected')
  link = workflow.links[id]
  $('#linkMetaData').val(JSON.stringify(link.analysis, null, 2))

selectNode = (id, type) ->
  $('#linkBoard').addClass('hide')
  $('#nodeBoard').removeClass('hide')
  if (!isNaN(parseInt(linkSelected)))
    oldclass = $('#board').find('.link'+linkSelected).attr('class')
    if !!oldclass
      newclass = oldclass.replace('selected', '');
      $('#board').find('.link'+linkSelected).attr('class', newclass)
  linkSelected = null
  if type == 'task'
    if (!isNaN(parseInt(taskSelected)))
      oldclass = $('#tasksBoard').find('.node'+taskSelected).attr('class')
      if !!oldclass
        newclass = oldclass.replace('selected', '');
        $('#tasksBoard').find('.node'+taskSelected).attr('class', newclass)
    taskSelected = id
    oldclass = $('#tasksBoard').find('.node'+taskSelected).attr('class')
    $('#tasksBoard').find('.node'+taskSelected).attr('class', oldclass+' selected')
    task = workflow.tasks[id]
    $('#taskName').val(task.name)
    $('#taskMetaData').val(JSON.stringify(task.json, null, 2))

    if (addingLink)
      if (nodeLink || isNaN(parseInt(node1)))
        taskLink = true
        nodeLink = false
        node1 = taskSelected
        node2 = null
      if (!isNaN(parseInt(node1)) && isNaN(parseInt(node2)) && node1 != taskSelected)
        node2 = taskSelected
        link =
          'sourceId': node1
          'targetId': node2
          'id': graph.links.length
        tgraph.addLink(link)
        workflow.taskLinks.push link
      if (!isNaN(parseInt(node1)) && !isNaN(parseInt(node2)) && node2 != taskSelected)
        node1 = node2
        node2 = taskSelected
        link =
          'sourceId': node1
          'targetId': node2
          'id': graph.links.length
        tgraph.addLink(link)
        workflow.taskLinks.push link
  else
    if (!isNaN(parseInt(nodeSelected)))
      oldclass = $('#board').find('.node'+nodeSelected).attr('class')
      if !!oldclass
        newclass = oldclass.replace('selected', '');
        $('#board').find('.node'+nodeSelected).attr('class', newclass)
    nodeSelected = id
    oldclass = $('#board').find('.node'+nodeSelected).attr('class')
    $('#board').find('.node'+nodeSelected).attr('class', oldclass+' selected')
    node = workflow.nodes[id]
    showTasks(id)
    $('#nodeTitle').val(node.name)

    if (addingLink)
      if (taskLink || isNaN(parseInt(node1)))
        taskLink = false
        nodeLink = true
        node1 = nodeSelected
        node2 = null
      if (!isNaN(parseInt(node1)) && isNaN(parseInt(node2)) && node1 != nodeSelected)
        node2 = nodeSelected
        link =
          'sourceId': node1
          'targetId': node2
          'id': graph.links.length
        graph.addLink(link)
        workflow.links.push link
      if (!isNaN(parseInt(node1)) && !isNaN(parseInt(node2)) && node2 != nodeSelected)
        node1 = node2
        node2 = nodeSelected
        link =
          'sourceId': node1
          'targetId': node2
          'id': graph.links.length
        graph.addLink(link)
        workflow.links.push link


$(document).ready ->
  $('#loadbtn').click ->
    $('#uploadfile').click()

  $('#uploadfile').change ->
    loadFile()

  $('#savebtn').click ->
    sw =
      'nodes': graph.nodes
      'links': graph.links
      'tasks': tgraph.nodes
      'taskLinks': tgraph.links
    blob = new Blob([JSON.stringify(sw)], {type: 'application/json;charset=utf-8'})
    saveAs(blob, 'workflow.json')

  $('#nodeTitle').on 'input', ->
    $('#board').find('.node'+nodeSelected).find('text').text($(this).val())
    workflow.nodes[nodeSelected].name = $(this).val()

  $('#taskName').on 'input', ->
    $('#tasksBoard').find('.node'+taskSelected).find('text').text($(this).val())
    workflow.tasks[taskSelected].name = $(this).val()

  $('#taskMetaData').on 'input', ->
    workflow.tasks[taskSelected].json = JSON.parse($(this).val())

  $('#addnode').click ->
    nodeName = prompt('Please enter node name', '')
    nodeId = workflow.nodes.length
    taskId = workflow.tasks.length
    node =
      'id': nodeId
      'name': nodeName
    graph.addNode(node)
    workflow.nodes.push node
    task =
      'id': taskId
      'name': nodeName
      'nodeId': nodeId
      'class': 'circle'
      'json': {}
    workflow.tasks.push task
  $('#addlink').click ->
    addingLink = !addingLink
    $('#addlink').toggleClass('active')
    node1 = null
    node2 = null
#    sourceId = parseInt(prompt('Please enter source id', ''))
#    targetId = parseInt(prompt('Please enter target id', ''))
#    link =
#      'sourceId': sourceId
#      'targetId': targetId
#    graph.addLink(link)
#    workflow.links.push link

  $('#addtask').click ->
    nodeName = prompt('Please enter task name', '')
    taskId = workflow.tasks.length
    task =
      'id': taskId
      'name': nodeName
      'nodeId': nodeSelected
      'class': 'circle'
      'json': {}
    tgraph.addNode(task)
    workflow.tasks.push task
#  $('#addtasklink').click ->
#    sourceId = parseInt(prompt('Please enter source id', ''))
#    targetId = parseInt(prompt('Please enter target id', ''))
#    link =
#      'sourceId': sourceId
#      'targetId': targetId
#    tgraph.addLink(link)
#    workflow.taskLinks.push link
  $('#library').click ->
    $('#libraryOperators').toggleClass('hide')
  $('#filterJoin').click ->
    $('#libraryOperators').toggleClass('hide')
    taskId = workflow.tasks.length
    task =
      'id': taskId
      'name': 'Filter Join'
      'nodeId': nodeSelected
      'class': 'circle'
      'json':
        'constraints':
          'input': 'number': 2
          'input0': 'type': 'SQL'
          'input1': 'type': 'SQL'
          'output': 'number': 1
          'output0': 'type': 'SQL'
          'opSpecification':
            'algorithm': 'name': 'SQL_query'
            'SQL_query': 'SELECT NATIONKEY, TOTALPRICE FROM $1 LEFT JOIN $2 ON $1.CUSTKEY=$2.CUSTKEY'
    tgraph.addNode(task)
    workflow.tasks.push task
  $('#groupBySort').click ->
    $('#libraryOperators').toggleClass('hide')
    taskId = workflow.tasks.length
    task =
      'id': taskId
      'name': 'groupBy Sort'
      'nodeId': nodeSelected
      'class': 'circle'
      'json':
        'constraints':
          'input': 'number': 1
          'input0': 'type': 'SQL'
          'output': 'number': 1
          'output0': 'type': 'SQL'
          'opSpecification':
            'algorithm': 'name': 'SQL_query'
            'SQL_query': 'SELECT NATIONKEY, SUM(TOTALPRICE) AS SUM FROM $1 GROUP BY NATIONKEY ORDER BY SUM'
    tgraph.addNode(task)
    workflow.tasks.push task
  $('#PeakDetection').click ->
    $('#libraryOperators').toggleClass('hide')
    taskId = workflow.tasks.length
    task =
      'id': taskId
      'name': 'PeakDetection'
      'nodeId': nodeSelected
      'class': 'circle'
      'json':
        'constraints':
          'input': 'number': 1
          'output': 'number': 1
          'opSpecification':
            'algorithm': 'name': 'PeakDetection'
    tgraph.addNode(task)
    workflow.tasks.push task
  $('#tfIdf').click ->
    $('#libraryOperators').toggleClass('hide')
    taskId = workflow.tasks.length
    task =
      'id': taskId
      'name': 'Tf-Idf'
      'nodeId': nodeSelected
      'class': 'circle'
      'json':
        'constraints':
          'input': 'number': 1
          'output': 'number': 1
          'opSpecification':
            'algorithm': 'name': 'TF_IDF'
    tgraph.addNode(task)
    workflow.tasks.push task
  $('#kMeans').click ->
    $('#libraryOperators').toggleClass('hide')
    taskId = workflow.tasks.length
    task =
      'id': taskId
      'name': 'k-Means'
      'nodeId': nodeSelected
      'class': 'circle'
      'json':
        'constraints':
          'input': 'number': 1
          'output': 'number': 1
          'opSpecification':
            'algorithm': 'name': 'k-means'
    tgraph.addNode(task)
    workflow.tasks.push task

  $('#analyse').click ->
    $.ajax '/php/index.php',
      data:
        action: 'analyse',
        workflow:
          'nodes': workflow.nodes,
          'links': workflow.links,
          'tasks': workflow.tasks,
          'taskLinks': workflow.taskLinks || [],
      type: 'POST',
      success: (data, textStatus, jqXHR) ->
#        console.log(data)
        newWorkflow = JSON.parse(data)
        newWorkflow.taskLinks = newWorkflow.taskLinks || []
        openWorkflow(newWorkflow)
      error: (jqXHR, textStatus, errorThrown) ->
        console.log(textStatus)

  $('#optimise').click ->
    $.ajax '/php/index.php',
      data:
        action: 'optimise',
        workflow:
          'nodes': workflow.nodes,
          'links': workflow.links,
          'tasks': workflow.tasks,
          'taskLinks': workflow.taskLinks || [],
      type: 'POST',
      success: (data, textStatus, jqXHR) ->
        newWorkflow = JSON.parse(data)
        newWorkflow.taskLinks = newWorkflow.taskLinks || []
        openWorkflow(newWorkflow)
      error: (jqXHR, textStatus, errorThrown) ->
        console.log(textStatus)

$.getJSON 'files/workflow.json', (json) ->
  openWorkflow(json)

graph = new wGraph('#board')

tgraph = new wGraph('#tasksBoard')