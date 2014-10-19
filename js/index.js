// Generated by CoffeeScript 1.7.1
(function() {
  var BubbleChart, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BubbleChart = (function() {
    function BubbleChart(data) {
      this.safe_string = __bind(this.safe_string, this);
      this.hide_details = __bind(this.hide_details, this);
      this.show_details = __bind(this.show_details, this);
      this.move_towards_target = __bind(this.move_towards_target, this);
      this.adjust_label_pos = __bind(this.adjust_label_pos, this);
      this.update = __bind(this.update, this);
      this.color_by = __bind(this.color_by, this);
      this.color_buttons = __bind(this.color_buttons, this);
      this.split_by = __bind(this.split_by, this);
      this.split_buttons = __bind(this.split_buttons, this);
      this.remove_nodes = __bind(this.remove_nodes, this);
      this.add_nodes = __bind(this.add_nodes, this);
      this.add_filter = __bind(this.add_filter, this);
      this.create_filters = __bind(this.create_filters, this);
      this.data = data;
      this.width = $(window).width();
      this.height = $(window).height() - 105;
      $.each(this.data, (function(_this) {
        return function(i, d) {
          return d.node_id = i;
        };
      })(this));
      this.tooltip = CustomTooltip("node_tooltip");
      this.vis = d3.select("#vis").append("svg").attr("viewBox", "0 0 " + this.width + " " + this.height);
      this.force = d3.layout.force().gravity(-0.01).charge(function(d) {
        return -Math.pow(d.radius, 2.0) * 1.5;
      }).size([this.width, this.height]);
      this.nodes = this.force.nodes();
      this.labels = [];
      this.curr_filters = [];
      this.create_filters();
      this.split_buttons();
      if (data.length !== 2886) {
        this.color_buttons();
      }
    }

    BubbleChart.prototype.create_filters = function() {
      var b_groups;
      this.filters = {};
      this.filter_names = [];
      $.each(this.data[0], (function(_this) {
        return function(d) {
          if (d !== 'node_id' && d !== 'name') {
            _this.filter_names.push({
              value: d
            });
            return _this.filters[d] = [];
          }
        };
      })(this));
      this.data.forEach((function(_this) {
        return function(d) {
          return $.each(d, function(k, v) {
            var filter_exists;
            if (k !== 'node_id' && k !== 'name') {
              filter_exists = $.grep(_this.filters[k], function(e) {
                return e.filter === k && e.value === v;
              });
              if (filter_exists.length === 0) {
                return _this.filters[k].push({
                  filter: k,
                  value: v
                });
              }
            }
          });
        };
      })(this));
      b_groups = [];
      $.each(this.filters, (function(_this) {
        return function(k, v) {
          var b_group;
          b_group = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: v
          });
          b_group.initialize();
          return b_groups.push({
            name: k,
            displayKey: 'value',
            source: b_group.ttAdapter(),
            templates: {
              header: '<h3 class="filter-header">' + k + '</h3>'
            }
          });
        };
      })(this));
      return $('#filter-select .typeahead').typeahead({
        hint: true,
        minLength: 1,
        autoselect: true
      }, b_groups).on('typeahead:selected typeahead:autocompleted', (function(_this) {
        return function(e, d) {
          _this.add_filter(d['filter'], d['value']);
          return $('.typeahead').typeahead('val', '');
        };
      })(this));
    };

    BubbleChart.prototype.add_filter = function(field, val) {
      var filter_button;
      this.curr_filters.push({
        filter: field,
        value: val
      });
      filter_button = $("<button>" + val + "</button>");
      filter_button.on("click", (function(_this) {
        return function(e) {
          _this.remove_nodes(field, val);
          return filter_button.detach();
        };
      })(this));
      $("#filter-select-buttons").append(filter_button);
      return this.add_nodes(field, val);
    };

    BubbleChart.prototype.add_nodes = function(field, val) {
      var split_id;
      this.data.forEach((function(_this) {
        return function(d) {
          var curr_class, curr_r, node, vals;
          if (d[field] === val) {
            if ($.grep(_this.nodes, function(e) {
              return e.node_id === d.node_id;
            }).length === 0) {
              vals = {};
              $.each(_this.filter_names, function(k, f) {
                return vals[f.value] = d[f.value];
              });
              curr_class = '';
              curr_r = 5;
              if (d['team']) {
                curr_class = d.team;
                curr_r = 8;
              }
              node = {
                id: d.node_id,
                radius: curr_r,
                name: d.name,
                values: vals,
                color: "#777",
                "class": curr_class,
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
      this.update();
      split_id = $(".split-button.active").attr('id');
      if (split_id !== void 0) {
        return this.split_by(split_id.split('-')[1]);
      }
    };

    BubbleChart.prototype.remove_nodes = function(field, val) {
      var len, should_remove;
      this.curr_filters = $.grep(this.curr_filters, (function(_this) {
        return function(e) {
          return e['filter'] !== field && e['value'] !== val;
        };
      })(this));
      len = this.nodes.length;
      while (len--) {
        if (this.nodes[len]['values'][field] === val) {
          should_remove = true;
          this.curr_filters.forEach((function(_this) {
            return function(k) {
              if (_this.nodes[len]['values'][k['filter']] === k['value']) {
                return should_remove = false;
              }
            };
          })(this));
          if (should_remove === true) {
            this.nodes.splice(len, 1);
          }
        }
      }
      return this.update();
    };

    BubbleChart.prototype.split_buttons = function() {
      $("#modifier-buttons").append("<div id='split-buttons'>Split By: </div>");
      return d3.select("#split-buttons").selectAll('button').data(this.filter_names).enter().append("button").text(function(d) {
        return d.value;
      }).attr("class", 'split-button').attr("id", function(d) {
        return 'split-' + d.value;
      }).on("click", (function(_this) {
        return function(d) {
          $(".split-button").removeClass('active');
          $("#split-" + d.value).addClass('active');
          return _this.split_by(d.value);
        };
      })(this));
    };

    BubbleChart.prototype.split_by = function(split) {
      var curr_col, curr_row, curr_vals, height_2, num_cols, num_rows, width_2;
      while (this.labels.length > 0) {
        this.labels.pop();
      }
      curr_vals = [];
      this.circles.each((function(_this) {
        return function(c) {
          if (curr_vals.indexOf(c['values'][split]) < 0) {
            return curr_vals.push(c['values'][split]);
          }
        };
      })(this));
      num_rows = Math.round(Math.sqrt(curr_vals.length)) + 1;
      num_cols = curr_vals.length / (num_rows - 1);
      curr_row = 0;
      curr_col = 0;
      width_2 = this.width * 0.75;
      height_2 = this.height * 0.8;
      curr_vals.forEach((function(_this) {
        return function(s, i) {
          var label;
          curr_vals[i] = {
            split: s,
            tarx: (_this.width * 0.1) + (0.5 + curr_col) * (width_2 / num_cols),
            tary: (_this.height * 0.2) + (0.5 + curr_row) * (height_2 / num_rows)
          };
          label = {
            val: s,
            split: split,
            x: curr_vals[i].tarx,
            y: curr_vals[i].tary,
            tarx: curr_vals[i].tarx,
            tary: curr_vals[i].tary
          };
          _this.labels.push(label);
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
            if (s.split === c['values'][split]) {
              c.tarx = s.tarx;
              return c.tary = s.tary;
            }
          });
        };
      })(this));
      return this.update();
    };

    BubbleChart.prototype.color_buttons = function() {
      $("#modifier-buttons").append("<div id='color-buttons'>Color By: </div>");
      return d3.select("#color-buttons").selectAll('button').data(this.filter_names).enter().append("button").text(function(d) {
        return d.value;
      }).attr("class", 'color-button').attr("id", function(d) {
        return 'color-' + d.value;
      }).on("click", (function(_this) {
        return function(d) {
          $(".color-button").removeClass('active');
          $("#color-" + d.value).addClass('active');
          return _this.color_by(d.value);
        };
      })(this));
    };

    BubbleChart.prototype.color_by = function(split) {
      var colors, curr_vals, g, l_size, legend, num_colors;
      curr_vals = [];
      this.circles.each((function(_this) {
        return function(c) {
          if (curr_vals.indexOf(c['values'][split]) < 0) {
            return curr_vals.push(c['values'][split]);
          }
        };
      })(this));
      num_colors = curr_vals.length;
      colors = d3.scale.category10();
      colors.domain(curr_vals);
      d3.select("#color-legend").selectAll("*").remove();
      l_size = 30;
      legend = d3.select("#color-legend").append("svg").attr("width", 150).attr("height", colors.domain().length * l_size).style("padding", "20px 0 0 20px");
      g = legend.selectAll("g").data(colors.domain()).enter().append("g");
      g.append("rect").attr("y", function(d, i) {
        return i * l_size;
      }).attr("rx", l_size * 0.5).attr("ry", l_size * 0.5).attr("width", l_size * 0.5).attr("height", l_size * 0.5).style("fill", (function(_this) {
        return function(d) {
          return colors(d);
        };
      })(this));
      g.append("text").attr("x", 20).attr("y", function(d, i) {
        return i * l_size + 12;
      }).text(function(d) {
        return d;
      });
      this.circles.each((function(_this) {
        return function(c) {
          return curr_vals.forEach(function(s) {
            if (s === c['values'][split]) {
              return c.color = String(colors(s));
            }
          });
        };
      })(this));
      return this.circles.attr("fill", function(d) {
        return d.color;
      });
    };

    BubbleChart.prototype.update = function() {
      var that;
      this.circles = this.vis.selectAll("circle").data(this.nodes, function(d) {
        return d.id;
      });
      that = this;
      this.circles.enter().append("circle").attr("r", 0).attr("stroke-width", 3).attr("id", function(d) {
        return "bubble_" + d.id;
      }).attr("fill", function(d) {
        return d.color;
      }).on("mouseover", function(d, i) {
        return that.show_details(d, i, this);
      }).on("mouseout", function(d, i) {
        return that.hide_details(d, i, this);
      }).attr("class", function(d) {
        if (d["class"].length > 0) {
          return d["class"].toLowerCase().replace(/\s/g, '_').replace('.', '');
        } else {
          return '';
        }
      });
      this.circles.transition().duration(2000).attr("r", function(d) {
        return d.radius;
      });
      this.circles.exit().remove();
      this.vis.selectAll(".split-labels").remove();
      this.text = this.vis.selectAll(".split-labels").data(this.labels);
      this.text.enter().append("text").attr("x", function(d) {
        return d.x;
      }).attr("y", function(d) {
        return d.y;
      }).attr("class", 'split-labels').text(function(d) {
        return d.val;
      });
      this.text.exit().remove();
      this.force.on("tick", (function(_this) {
        return function(e) {
          _this.circles.each(_this.move_towards_target(e.alpha)).attr("cx", function(d) {
            return d.x;
          }).attr("cy", function(d) {
            return d.y;
          });
          _this.text.each(_this.adjust_label_pos());
          return _this.text.each(_this.move_towards_target(e.alpha)).attr("x", function(d) {
            return d.x;
          }).attr("y", function(d) {
            return d.y;
          });
        };
      })(this));
      return this.force.start();
    };

    BubbleChart.prototype.adjust_label_pos = function() {
      return (function(_this) {
        return function(d) {
          var max_x, min_x, min_y;
          min_y = 10000;
          min_x = 10000;
          max_x = 0;
          _this.circles.each(function(c) {
            if (d.val === c['values'][d.split]) {
              if ((c.y - c.radius) < min_y) {
                min_y = c.y - c.radius;
              }
              if ((c.x - c.radius) < min_x) {
                min_x = c.x - c.radius;
              }
              if ((c.x + c.radius) > max_x) {
                return max_x = c.x + c.radius;
              }
            }
          });
          d.tary = min_y - 10;
          return d.tarx = (max_x - min_x) / 2.0 + min_x;
        };
      })(this);
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
      var content;
      content = "<div class='tooltip-name'>" + data.name + "</div>";
      $.each(data.values, function(k, v) {
        return content += "" + v + "<br/>";
      });
      return this.tooltip.showTooltip(content, d3.event);
    };

    BubbleChart.prototype.hide_details = function(data, i, element) {
      return this.tooltip.hideTooltip();
    };

    BubbleChart.prototype.safe_string = function(input) {
      return input.toLowerCase().replace(/\s/g, '_').replace('.', '');
    };

    return BubbleChart;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  $(function() {
    var chart, render_vis;
    chart = null;
    render_vis = function(csv) {
      $("#filter-select-wrapper").css("visibility", "visible");
      $(".fileContainer").hide();
      return chart = new BubbleChart(csv);
    };
    $("#file-uploader").on('change', (function(_this) {
      return function(e) {
        var file, fileReader;
        file = e.target.files[0];
        if (file.type === 'text/csv') {
          fileReader = new FileReader();
          fileReader.onload = function(e) {
            return render_vis(d3.csv.parse(fileReader.result));
          };
          return fileReader.readAsText(file);
        }
      };
    })(this));
    return $("#nfl-dataset").on('click', (function(_this) {
      return function(e) {
        return d3.csv("data/football/players.csv", render_vis);
      };
    })(this));
  });

}).call(this);
