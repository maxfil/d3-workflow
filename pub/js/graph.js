var wGraph;

wGraph = function(el) {
  var findNode, findNodeIndex, force, h, links, nodes, rectH, rectW, update, vis, w;
  rectW = 70;
  rectH = 40;
  this.addNode = function(id, text) {
    console.log({
      'id': id,
      'text': text
    });
    nodes.push({
      'id': id,
      'text': text
    });
    update();
  };
  this.removeNode = function(id) {
    var i, index, n;
    i = 0;
    n = findNode(id);
    while (i < links.length) {
      if (links[i]['source'] === n || links[i]['target'] === n) {
        links.splice(i, 1);
      } else {
        i++;
      }
    }
    index = findNodeIndex(id);
    if (index !== void 0) {
      nodes.splice(index, 1);
      update();
    }
  };
  this.addLink = function(sourceId, targetId) {
    var sourceNode, targetNode;
    console.log(sourceId);
    console.log(targetId);
    sourceNode = findNode(sourceId);
    targetNode = findNode(targetId);
    console.log(sourceNode);
    console.log(targetNode);
    if (sourceNode !== void 0 && targetNode !== void 0) {
      links.push({
        'source': sourceNode,
        'target': targetNode
      });
      update();
    }
  };
  findNode = function(id) {
    var i;
    i = 0;
    while (i < nodes.length) {
      if (nodes[i].id === id) {
        return nodes[i];
      }
      i++;
    }
  };
  findNodeIndex = function(id) {
    var i;
    i = 0;
    while (i < nodes.length) {
      if (nodes[i].id === id) {
        return i;
      }
      i++;
    }
  };
  w = $(el).innerWidth();
  h = $(el).innerHeight();
  vis = this.vis = d3.select(el).append('svg:svg').attr('width', w).attr('height', h);
  force = d3.layout.force().gravity(.05).distance(90).charge(-300).size([w, h]);
  nodes = force.nodes();
  links = force.links();
  this.clean = function() {
    vis.selectAll('svg > *').remove();
    nodes.splice(0, nodes.length);
    links.splice(0, links.length);
    return vis.append('defs').append('marker').attr('id', 'arrow').attr('viewBox', '0 -5 10 10').attr('refX', 10).attr('refY', 0).attr('markerWidth', 5).attr('markerHeight', 5).attr('orient', 'auto').append('path').attr('d', 'M0,-5L10,0L0,5');
  };
  update = function() {
    var link, node, nodeEnter;
    link = vis.selectAll('line.link').data(links, function(d) {
      return d.source.id + '-' + d.target.id;
    });
    link.enter().insert('line').attr('class', 'link').attr('marker-end', 'url(#arrow)');
    link.exit().remove();
    node = vis.selectAll('g.node').data(nodes, function(d) {
      return d.id;
    });
    nodeEnter = node.enter().append('g').attr('class', 'node').attr('id', function(d) {
      return 'node' + d.id;
    }).attr('onclick', function(d) {
      return 'selectNode(' + d.id + ')';
    }).call(force.drag);
    nodeEnter.append('rect').attr('class', 'rect').attr('width', rectW).attr('height', rectH).attr('x', -rectW / 2).attr('y', -rectH / 2);
    nodeEnter.append('ellipse').attr('class', 'ellipse').attr('cx', 0).attr('cy', 0).attr('rx', function(d) {
      if (d.type === 'circle') {
        return rectH / 2;
      } else {
        return rectW / 2 - 5;
      }
    }).attr('ry', function(d) {
      if (d.type === 'circle') {
        return rectH / 2;
      } else {
        return rectH / 2 - 2;
      }
    });
    nodeEnter.append('text').attr('class', 'nodetext').attr('x', 0).attr('y', 4).attr('text-anchor', 'middle').text(function(d) {
      return d.text;
    });
    node.exit().remove();
    force.on('tick', function() {
      link.attr('x1', function(d) {
        var k, x1, x2, y1, y2;
        x1 = d.source.x;
        x2 = d.target.x;
        y1 = d.source.y;
        y2 = d.target.y;
        k = rectW / rectH;
        if (Math.abs(x1 - x2) >= Math.abs(y1 - y2) * k) {
          return x1 - Math.sign(x1 - x2) * rectW / 2;
        } else {
          return x1 - rectH / 2 / Math.abs(y1 - y2) * (x1 - x2);
        }
      }).attr('y1', function(d) {
        var k, x1, x2, y1, y2;
        x1 = d.source.x;
        x2 = d.target.x;
        y1 = d.source.y;
        y2 = d.target.y;
        k = rectW / rectH;
        if (Math.abs(x1 - x2) <= Math.abs(y1 - y2) * k) {
          return y1 - Math.sign(y1 - y2) * rectH / 2;
        } else {
          return y1 - rectW / 2 / Math.abs(x1 - x2) * (y1 - y2);
        }
      }).attr('x2', function(d) {
        var k, x1, x2, y1, y2;
        x1 = d.source.x;
        x2 = d.target.x;
        y1 = d.source.y;
        y2 = d.target.y;
        k = rectW / rectH;
        if (Math.abs(x1 - x2) >= Math.abs(y1 - y2) * k) {
          return x2 + Math.sign(x1 - x2) * rectW / 2;
        } else {
          return x2 + rectH / 2 / Math.abs(y1 - y2) * (x1 - x2);
        }
      }).attr('y2', function(d) {
        var k, x1, x2, y1, y2;
        x1 = d.source.x;
        x2 = d.target.x;
        y1 = d.source.y;
        y2 = d.target.y;
        k = rectW / rectH;
        if (Math.abs(x1 - x2) <= Math.abs(y1 - y2) * k) {
          return y2 + Math.sign(y1 - y2) * rectH / 2;
        } else {
          return y2 + rectW / 2 / Math.abs(x1 - x2) * (y1 - y2);
        }
      });
      node.attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });
    });
    force.start();
  };
  update();
};
