// Generated by CoffeeScript 1.7.1
(function() {
  $(function() {
    var chart, render_vis;
    chart = null;
    render_vis = function(csv, params) {
      if (params == null) {
        params = null;
      }
      $(".load-screen").hide();
      return chart = new Potato(csv, params);
    };
    $("#file-uploader").on('change', (function(_this) {
      return function(e) {
        var file, fileReader;
        file = e.target.files[0];
        console.log(file);
        if (file.type === 'text/csv') {
          fileReader = new FileReader();
          fileReader.onload = function(e) {
            return render_vis(d3.csv.parse(fileReader.result));
          };
          return fileReader.readAsText(file);
        }
      };
    })(this));
    $("#basketball-dataset").on('click', (function(_this) {
      return function(e) {
        return d3.csv("data/basketball/basketball.csv", function(csv) {
          return render_vis(csv, {
            split: true,
            size: true,
            order: true,
            "class": 'team'
          });
        });
      };
    })(this));
    $("#billionaire-dataset").on('click', (function(_this) {
      return function(e) {
        return d3.csv("data/billion/billionaire.csv", function(csv) {
          return render_vis(csv);
        });
      };
    })(this));
    return $("#auto-dataset").on('click', (function(_this) {
      return function(e) {
        return d3.csv("data/auto/auto.csv", function(csv) {
          return render_vis(csv);
        });
      };
    })(this));
  });

}).call(this);
