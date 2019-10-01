// /*
var isMobile = false;
/*/
var isMobile = true;
// */
var draggable = (function() {
  /*  function getWidth(e){
    return parseFloat(getComputedStyle(e).getPropertyValue('width'));
  }
  function getHeight(e){
  return parseFloat(getComputedStyle(e).getPropertyValue('height'));
  }*/
  Element.prototype.on = Element.prototype.addEventListener;
  Element.prototype.off = Element.prototype.removeEventListener;

  // If event was on a gutter
  var g = false;
  // Previous and next siblings
  var p, n;
  // Gutter, previus, and next widths
  var px = 0,
    gx = 0,
    nx = 0,
    ox = 0;
  // Gutter, previus, and next heights
  var py = 0,
    gy = 0,
    ny = 0,
    oy = 0;
  // total dimensions
  var total = 0;
  // var minSize = 75;
  var snap = 30;
  // Property
  // var prop = "";
  var onmove = true;


  // Clamps number to range, with snap distance
  function clamp(n, min, max, snap) {
    var g = Math.max(Math.min(n, max), min);
      if(g > max-snap) g = max;
      if(g < min+snap) g = min;
    return g;
  }

  function capitalize(a) {
    return a.charAt(0).toUpperCase() + a.substr(1);
  }
  //Converts selector or element to element
  function getElem(a) {
    if (typeof a === "string" || a instanceof String) {
      return document.querySelector(a);
    } else if (a instanceof HTMLElement) {
      return a;
    }
  }

  // Modifiable width/height functions
  function getWidth(e) {
    return e.offsetWidth;
  }

  function getHeight(e) {
    return e.offsetHeight;
  }

  document.body.addEventListener('mousedown', function(e) {
    if (e.target.classList.contains("gutter")) {
      g = e.target;
      p = g.previousElementSibling;
      n = g.nextElementSibling;
      if (e.target.classList.contains("x")) {
        px = getWidth(p);
        gx = getWidth(g);
        nx = getWidth(n);
        ox = e.clientX;
        total = px + gx + nx;
      } else if (e.target.classList.contains("y")) {
        py = getHeight(p);
        gy = getHeight(g);
        ny = getHeight(n);
        oy = e.clientY;
        total = py + gy + ny;
      }
    }
  });
  document.body.addEventListener('mouseup', function(e) {
    if ((g !== false)) {
      if (!onmove) {
        var minSize = n.dataset.minSize || 0;
        if (g.classList.contains("x")) {
          // var h = clamp(px-(ox-e.clientX), 100, total-100)/total*100;
          // p.style.width = h+"%";
          // n.style.width = 100-h+'%';
          var h = clamp(px - (ox - e.clientX), minSize, total - minSize);

          p.style.width = h + "px";
          n.style.width = total - h + 'px';
        } else if (g.classList.contains("y")) {
          // var h = clamp(px-(ox-e.clientX), 100, total-100)/total*100;
          // p.style.width = h+"%";
          // n.style.width = 100-h+'%';
          var h = clamp(py - (oy - e.clientY), minSize, total - minSize);

          p.style.height = h + "px";
          n.style.height = total - h + 'px';
        }
      }
    }
    g = false;
  });
  document.body.addEventListener('mousemove', function(e) {
    if ((g !== false) && onmove) {
      e.preventDefault();
      var minSize = n.dataset.minSize || 0;
      if (g.classList.contains("x")) {
        // var h = clamp(px-(ox-e.clientX), 100, total-100)/total*100;
        // p.style.width = h+"%";
        // n.style.width = 100-h+'%';
        var h = clamp(px - (ox - e.clientX), minSize, total - minSize, snap);

        p.style.width = h + "px";
        n.style.width = total - h + 'px';
      } else if (g.classList.contains("y")) {
        // var h = clamp(px-(ox-e.clientX), 100, total-100)/total*100;
        // p.style.width = h+"%";
        // n.style.width = 100-h+'%';
        var h = clamp(py - (oy - e.clientY), minSize, total - minSize, snap);

        p.style.height = h + "px";
        n.style.height = total - h + 'px';
      }
    }
    // return e.preventDefault();
  });
  document.body.addEventListener('dragstart', function(e) {
    e.preventDefault();
    if ((g !== false) && onmove) {
      return false;
    }
    // return e.preventDefault();
  });
  function draggable(elems, config) {
    config = (function(d) {
      var def = {
        axis: "x",
        sizes: [],
        gutter: "10px",
        snap: 0,
        minSize: 75,
        cursor: (d.axis === "x" ? "ew-resize" : "ns-resize"),
      };
      for (var i in def) {
        if (typeof d[i] !== "undefined") def[i] = d[i];
      }
      return def;
    })(config || {});
    if ((config.mobile && isMobile) || !isMobile) {
      elems = elems.map(getElem);
      var parent = undefined;
      var gutters = [];
      var prop = (config.axis === "y" ? "height" : "width");

      Array.from(elems).map(function(e, i) {
        if (parent == undefined) parent = e.parentNode;
        else if (e.parentNode !== parent) throw ("Elements do not have a universal parent.");
        e.style[prop] = config.sizes[i] || 1 / elems.length * 100 + "%";
        e.dataset.minSize = config.minSize || 0;
      });

      elems.forEach(function(e, i) {
        if (0 < i && i < elems.length) {
          var gutter = document.createElement("div");
          gutter.classList.add('gutter');
          gutter.classList.add(config.axis);
          gutter.style["min" + capitalize(prop)] = config.gutter;
          e.parentNode.insertBefore(gutter, e);
          gutters.push(gutter);
        }
      });

      var total = elems.reduce(function(a, b) {
        return a + (config.axis === "y" ? getHeight : getWidth)(b);
      }, 0) + gutters.length * parseFloat(config.gutter);
      parent.classList.add(config.axis === "y" ? "split-vertical" : "split-horizontal")
    }
  }
  return draggable;
}());
