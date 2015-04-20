var myGraph;

myGraph = function(el) {
  var findNode, findNodeIndex, force, h, links, nodes, update, vis, w;
  this.addNode = function(id) {
    nodes.push({
      'id': id
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
    sourceNode = findNode(sourceId);
    targetNode = findNode(targetId);
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
  force = d3.layout.force().gravity(.05).distance(100).charge(-100).size([w, h]);
  nodes = force.nodes();
  links = force.links();
  update = function() {
    var link, node, nodeEnter;
    link = vis.selectAll('line.link').data(links, function(d) {
      return d.source.id + '-' + d.target.id;
    });
    link.enter().insert('line').attr('class', 'link');
    link.exit().remove();
    node = vis.selectAll('g.node').data(nodes, function(d) {
      return d.id;
    });
    nodeEnter = node.enter().append('g').attr('class', 'node').call(force.drag);
    nodeEnter.append('image').attr('class', 'circle').attr('xlink:href', 'https://d3nwyuy0nl342s.cloudfront.net/images/icons/public.png').attr('x', '-8px').attr('y', '-8px').attr('width', '16px').attr('height', '16px');
    nodeEnter.append('text').attr('class', 'nodetext').attr('dx', 12).attr('dy', '.35em').text(function(d) {
      return d.id;
    });
    node.exit().remove();
    force.on('tick', function() {
      link.attr('x1', function(d) {
        return d.source.x;
      }).attr('y1', function(d) {
        return d.source.y;
      }).attr('x2', function(d) {
        return d.target.x;
      }).attr('y2', function(d) {
        return d.target.y;
      });
      node.attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });
    });
    force.start();
  };
  update();
};
