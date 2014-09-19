// Generated by CoffeeScript 1.7.1
(function() {
  var BubbleChart, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BubbleChart = (function() {
    function BubbleChart(data) {
      this.hide_details = __bind(this.hide_details, this);
      this.show_details = __bind(this.show_details, this);
      this.move_towards_target = __bind(this.move_towards_target, this);
      this.update = __bind(this.update, this);
      this.split_by = __bind(this.split_by, this);
      this.split_buttons = __bind(this.split_buttons, this);
      this.remove_nodes = __bind(this.remove_nodes, this);
      this.add_nodes = __bind(this.add_nodes, this);
      this.add_filter = __bind(this.add_filter, this);
      this.create_filters = __bind(this.create_filters, this);
      var filters;
      this.data = data;
      this.width = 960;
      this.height = 750;
      this.tooltip = CustomTooltip("player_tooltip");
      this.vis = d3.select("#vis").append("svg").attr("width", this.width).attr("height", this.height);
      this.force = d3.layout.force().gravity(-0.01).charge(function(d) {
        return -Math.pow(d.radius, 2.0) * 1.5;
      }).size([this.width, this.height]);
      this.nodes = this.force.nodes();
      filters = ['position', 'school', 'team'];
      this.curr_filters = [];
      this.create_filters(filters);
      this.split_buttons();
    }

    BubbleChart.prototype.create_filters = function(filters) {
      filters.forEach((function(_this) {
        return function(f, i) {
          return filters[i] = {
            type: f,
            vals: []
          };
        };
      })(this));
      this.data.forEach((function(_this) {
        return function(d) {
          return filters.forEach(function(f) {
            if (f.vals.indexOf(d[f.type]) < 0) {
              return f.vals.push(d[f.type]);
            }
          });
        };
      })(this));
      filters.forEach((function(_this) {
        return function(f) {
          return d3.select("#filter-select").selectAll('option').data(f.vals).enter().append("option").attr("value", function(d) {
            return f.type + ':' + d;
          }).text(function(d) {
            return d;
          });
        };
      })(this));
      return $("#filter-select").select2({
        placeholder: 'Start typing anything',
        width: 'resolve'
      }).on("change", (function(_this) {
        return function(e) {
          var val;
          if (typeof e.added !== 'undefined') {
            if (typeof e.added.id !== 'undefined') {
              val = e.added.id.split(':');
              _this.add_nodes(val[0], val[1]);
              return _this.add_filter(val[0], val[1]);
            }
          }
        };
      })(this));
    };

    BubbleChart.prototype.add_filter = function(field, val) {
      var button, rand;
      this.curr_filters.push(field + ':' + val);
      rand = String(Math.random()).substring(2, 12);
      $("#filter-select-wrapper").append("<button id='" + rand + "'>" + val + "</button>");
      button = $("#" + rand);
      return button.on("click", (function(_this) {
        return function(e) {
          _this.remove_nodes(field + ':' + val);
          return button.detach();
        };
      })(this));
    };

    BubbleChart.prototype.add_nodes = function(field, val) {
      this.data.forEach((function(_this) {
        return function(d) {
          var node;
          if (d[field] === val) {
            if ($.grep(_this.nodes, function(e) {
              return e.id === d.id;
            }).length === 0) {
              node = {
                id: d.id,
                radius: 8,
                name: d.name,
                values: ['team:' + d.team, 'school:' + d.school, 'position:' + d.position],
                color: d.team,
                x: Math.random() * 900,
                y: Math.random() * 800,
                tarx: _this.width / 2.0,
                tary: _this.height / 2.0
              };
              return _this.nodes.push(node);
            }
          }
        };
      })(this));
      return this.update();
    };

    BubbleChart.prototype.remove_nodes = function(val) {
      var len;
      this.curr_filters.splice(this.curr_filters.indexOf(val), 1);
      len = this.nodes.length;
      while (len--) {
        if ($.inArray(val, this.nodes[len]['values']) > 0) {
          if ($(this.curr_filters).filter(this.nodes[len]['values']).length === 0) {
            console.log('removing node');
            this.nodes.splice(len, 1);
          }
        }
      }
      console.log(this.nodes);
      console.log(this.curr_filters);
      return this.update();
    };

    BubbleChart.prototype.split_buttons = function() {
      $('#split-school').on("click", (function(_this) {
        return function(e) {
          return _this.split_by('school');
        };
      })(this));
      $('#split-team').on("click", (function(_this) {
        return function(e) {
          return _this.split_by('team');
        };
      })(this));
      return $('#split-position').on("click", (function(_this) {
        return function(e) {
          return _this.split_by('position');
        };
      })(this));
    };

    BubbleChart.prototype.split_by = function(split) {
      var curr_col, curr_row, curr_vals, height_2, num_cols, num_rows, width_2;
      curr_vals = [];
      this.circles.each((function(_this) {
        return function(c) {
          if (curr_vals.indexOf(c[split]) < 0) {
            return curr_vals.push(c[split]);
          }
        };
      })(this));
      num_rows = Math.round(Math.sqrt(curr_vals.length)) + 1;
      num_cols = curr_vals.length / (num_rows - 1);
      curr_row = 0;
      curr_col = 0;
      width_2 = this.width - 200;
      height_2 = this.height - 130;
      curr_vals.forEach((function(_this) {
        return function(s, i) {
          curr_vals[i] = {
            split: s,
            tarx: 50 + (0.5 + curr_col) * (width_2 / num_cols),
            tary: 70 + (0.5 + curr_row) * (height_2 / num_rows)
          };
          curr_col++;
          if (curr_col >= num_cols) {
            curr_col = 0;
            return curr_row++;
          }
        };
      })(this));
      this.circles.each((function(_this) {
        return function(c) {
          return curr_vals.forEach(function(s) {
            if (s.split === c[split]) {
              c.tarx = s.tarx;
              return c.tary = s.tary;
            }
          });
        };
      })(this));
      return this.update();
    };

    BubbleChart.prototype.update = function() {
      var that;
      this.circles = this.vis.selectAll("circle").data(this.nodes, function(d) {
        return d.id;
      });
      that = this;
      this.circles.enter().append("circle").attr("r", 0).attr("stroke-width", 3).attr("id", function(d) {
        return "bubble_" + d.id;
      }).attr("class", function(d) {
        return d.color.toLowerCase().replace(/\s/g, '_').replace('.', '');
      }).on("mouseover", function(d, i) {
        return that.show_details(d, i, this);
      }).on("mouseout", function(d, i) {
        return that.hide_details(d, i, this);
      });
      this.circles.transition().duration(2000).attr("r", function(d) {
        return d.radius;
      });
      this.circles.exit().remove();
      this.force.on("tick", (function(_this) {
        return function(e) {
          return _this.circles.each(_this.move_towards_target(e.alpha)).attr("cx", function(d) {
            return d.x;
          }).attr("cy", function(d) {
            return d.y;
          });
        };
      })(this));
      return this.force.start();
    };

    BubbleChart.prototype.move_towards_target = function(alpha) {
      return (function(_this) {
        return function(d) {
          d.x = d.x + (d.tarx - d.x) * 0.7 * alpha;
          return d.y = d.y + (d.tary - d.y) * 0.7 * alpha;
        };
      })(this);
    };

    BubbleChart.prototype.show_details = function(data, i, element) {
      var content, vals;
      content = "<div class='tooltip-name'>" + data.name + "</div>";
      vals = data.values;
      vals.forEach((function(_this) {
        return function(v) {
          return content += "" + (v.split(':')[1]) + "<br/>";
        };
      })(this));
      return this.tooltip.showTooltip(content, d3.event);
    };

    BubbleChart.prototype.hide_details = function(data, i, element) {
      return this.tooltip.hideTooltip();
    };

    return BubbleChart;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  $(function() {
    var chart, render_conf, render_vis;
    chart = null;
    render_vis = function(csv) {
      return chart = new BubbleChart(csv);
    };
    d3.csv("data/players.csv", render_vis);
    render_conf = function(csv) {
      var conferences;
      conferences = [];
      d3.csv.parseRows(csv).forEach((function(_this) {
        return function(r) {
          return conferences.push({
            name: r[0],
            teams: r.slice(1)
          });
        };
      })(this));
      return d3.select("#school-select-wrapper").selectAll('button').data(conferences).enter().append("button").attr("value", function(d) {
        return d.name;
      }).text(function(d) {
        return d.name;
      }).on("click", function(d) {
        return $("#school-select").select2('val', d.teams, true);
      });
    };
    return d3.text("data/conferences.csv", render_conf);
  });

}).call(this);
