nodeSelected = null
workflow = null

openWorkflow = (w) ->
  workflow = w
  graph.clean()
  for node, i in w.nodes
    graph.addNode(i, node.name)
  for link in w.edges
    graph.addLink(link.source, link.target)

loadFile = ->
  input = $('#uploadfile')[0]
  file = input.files[0]
  fr = new FileReader()
  fr.onload = (e) ->
    lines = e.target.result
    newWorkflow = JSON.parse(lines)
    openWorkflow(newWorkflow)
  fr.readAsText(file)

selectNode = (id) ->
  nodeSelected = id
  node = workflow.nodes[id]
  task = workflow.tasks[id]
  $('#nodeTitle').val(node.name)
  $('#taskName').val(task.name)
  $('#taskMetaData').val(JSON.stringify(task.json, null, 2))

$(document).ready ->
  $('#loadbtn').click ->
    $('#uploadfile').click()

  $('#uploadfile').change ->
    loadFile()

  $('#savebtn').click ->
    blob = new Blob([JSON.stringify(workflow)], {type: 'application/json;charset=utf-8'})
    saveAs(blob, 'workflow.json')

  $('#nodeTitle').on 'input', ->
    $('#node'+nodeSelected).find('text').text($(this).val())
    workflow.nodes[nodeSelected].name = $(this).val()

  $('#taskName').on 'input', ->
    workflow.tasks[nodeSelected].name = $(this).val()

  $('#taskMetaData').on 'input', ->
    workflow.tasks[nodeSelected].json = JSON.parse($(this).val())

  $('#addnode').click ->
    nodeName = prompt('Please enter node name', '')
    id = workflow.nodes.length
    graph.addNode(id, nodeName)
    workflow.nodes.push 'name': nodeName
    workflow.tasks.push
      'name': nodeName
      'node_id': id
  $('#addlink').click ->
    sourceId = parseInt(prompt('Please enter source id', ''))
    targetId = parseInt(prompt('Please enter target id', ''))
    graph.addLink(sourceId, targetId)
    workflow.edges.push
      'source': sourceId
      'target': targetId

$.getJSON 'files/workflow.json', (json) ->
  openWorkflow(json)

graph = new wGraph('#board')