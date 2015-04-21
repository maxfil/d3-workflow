wGraph = (el) ->
#node sizes
  rectW = 70
  rectH = 40
# Add and remove elements on the graph object

  @addNode = (id, text) ->
    console.log({'id': id, 'text':text})
    nodes.push
      'id': id
      'text': text
    update()
    return

  @removeNode = (id) ->
    i = 0
    n = findNode(id)
    while i < links.length
      if links[i]['source'] == n or links[i]['target'] == n
        links.splice i, 1
      else
        i++
    index = findNodeIndex(id)
    if index != undefined
      nodes.splice index, 1
      update()
    return

  @addLink = (sourceId, targetId) ->
    console.log(sourceId)
    console.log(targetId)
    sourceNode = findNode(sourceId)
    targetNode = findNode(targetId)
    console.log(sourceNode)
    console.log(targetNode)
    if sourceNode != undefined and targetNode != undefined
      links.push
        'source': sourceNode
        'target': targetNode
      update()
    return

  findNode = (id) ->
    i = 0
    while i < nodes.length
      if nodes[i].id == id
        return nodes[i]
      i++
    return

  findNodeIndex = (id) ->
    i = 0
    while i < nodes.length
      if nodes[i].id == id
        return i
      i++
    return

  # set up the D3 visualisation in the specified element
  w = $(el).innerWidth()
  h = $(el).innerHeight()
  vis = @vis = d3.select(el).append('svg:svg').attr('width', w).attr('height', h)
  force = d3.layout.force().gravity(.05).distance(90).charge(-300).size([w, h])
  nodes = force.nodes()
  links = force.links()

  @clean = ->
    vis.selectAll('svg > *').remove()
    nodes.splice(0, nodes.length)
    links.splice(0, links.length)
    vis.append('defs').append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 10)
    .attr('refY', 0)
    .attr('markerWidth', 5)
    .attr('markerHeight', 5)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')

  update = ->
    link = vis.selectAll('line.link').data links, (d) ->
      d.source.id + '-' + d.target.id
    link.enter().insert('line').attr('class', 'link').attr('marker-end', 'url(#arrow)')
    link.exit().remove()

    node = vis.selectAll('g.node').data(nodes, (d) -> d.id)
    nodeEnter = node.enter().append('g')
    .attr('class', 'node').attr('id', (d) -> 'node'+d.id)
    .attr('onclick', (d) -> 'selectNode('+d.id+')')
    .call(force.drag)
    nodeEnter.append('rect').attr('class', 'rect')
    .attr('width', rectW).attr('height', rectH)
    .attr('x', -rectW/2).attr('y', -rectH/2)

    nodeEnter.append('ellipse').attr('class', 'ellipse').attr('cx', 0).attr('cy', 0)
    .attr('rx', (d) ->
      if (d.type == 'circle')
        rectH/2
      else
        rectW/2-5)
    .attr('ry', (d) ->
      if (d.type == 'circle')
        rectH/2
      else
        rectH/2-2)
    nodeEnter.append('text').attr('class', 'nodetext')
    .attr('x', 0).attr('y', 4).attr('text-anchor', 'middle')
    .text((d) -> d.text)
    node.exit().remove()

    force.on 'tick', ->
      link.attr('x1', (d) ->
        x1 = d.source.x
        x2 = d.target.x
        y1 = d.source.y
        y2 = d.target.y
        k = rectW/rectH
        if Math.abs(x1-x2) >= Math.abs(y1-y2)*k
          x1-Math.sign(x1-x2)*rectW/2
        else
          x1-rectH/2/Math.abs(y1-y2)*(x1-x2)
      ).attr('y1', (d) ->
        x1 = d.source.x
        x2 = d.target.x
        y1 = d.source.y
        y2 = d.target.y
        k = rectW/rectH
        if Math.abs(x1-x2) <= Math.abs(y1-y2)*k
          y1-Math.sign(y1-y2)*rectH/2
        else
          y1-rectW/2/Math.abs(x1-x2)*(y1-y2)
      ).attr('x2', (d) ->
        x1 = d.source.x
        x2 = d.target.x
        y1 = d.source.y
        y2 = d.target.y
        k = rectW/rectH
        if Math.abs(x1-x2) >= Math.abs(y1-y2)*k
          x2+Math.sign(x1-x2)*rectW/2
        else
          x2+rectH/2/Math.abs(y1-y2)*(x1-x2)
      ).attr('y2', (d) ->
        x1 = d.source.x
        x2 = d.target.x
        y1 = d.source.y
        y2 = d.target.y
        k = rectW/rectH
        if Math.abs(x1-x2) <= Math.abs(y1-y2)*k
          y2+Math.sign(y1-y2)*rectH/2
        else
          y2+rectW/2/Math.abs(x1-x2)*(y1-y2)
      )
      node.attr 'transform', (d) ->
        'translate(' + d.x + ',' + d.y + ')'
      return
    # Restart the force layout.
    force.start()
    return

  # Make it all go
  update()
  return