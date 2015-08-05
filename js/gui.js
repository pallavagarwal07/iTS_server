// Generated by CoffeeScript 1.9.3
var clearAll, cmd, cmd_number, compile, createAlert, create_scope, curRunning, define_variable, delete_scope, highlight_line, input_processed, marker, prev_out, prev_scale, reset, scale, simulate, speed, start_sim, stdin_write, stdout_print, time, update_variable;

this.resize_list = [];

cmd_number = 0;

cmd = [];

prev_out = "";

marker = null;

curRunning = null;

time = 1000;

scale = 1;

input_processed = 0;

prev_scale = 0;

speed = {
  0: 5000,
  1: 10,
  2: 7,
  3: 4,
  4: 2,
  5: 1,
  6: 0.5,
  7: 0.25,
  8: 0.14,
  9: 0.1,
  10: 0
};

$(function() {
  return $('#slider').slider({
    animate: true,
    value: 5,
    max: 10,
    change: function() {
      return scale = speed[$('#slider').slider("value")];
    }
  });
});

$(function() {
  return $('#pause').change(function() {
    console.log("Here");
    if ($('#pause').prop('checked') === true) {
      $('#pause_label span').text("Play");
      $('#slider').slider("disable");
      prev_scale = scale;
      return scale = 5000;
    } else {
      $('#pause_label span').text("Pause");
      $('#slider').slider("enable");
      scale = prev_scale;
      window.clearTimeout(curRunning);
      return simulate();
    }
  });
});

$(function() {
  $('#stdout').text("");
  $('#stdin_highlight').hide();
  return $('#pause_label').css('height', $('#reset').css('height'));
});

stdout_print = function(b64str) {
  var final_out, stdoutStr;
  $('#stdout').css('background-color', '#CE6');
  setTimeout(function() {
    return $('#stdout').css('background-color', '#FFF');
  }, 40);
  stdoutStr = window.atob(b64str);
  final_out = $('#stdout').val() + stdoutStr;
  $('#stdout').val(final_out);
  $('#stdout').animate({
    scrollTop: $('#stdout')[0].scrollHeight - $('#stdout').height()
  }, 500);
  return time = 1000;
};

stdin_write = function(n) {
  var s;
  s = $('#stdin_highlight').html();
  if (input_processed === 0) {
    s = "<samp><span id='highlight_input'>" + s.substr(6);
    s = s.substr(0, n + 33) + "</span>" + s.substr(n + 33);
  } else {
    s = s.replace("</span>", "");
    s = s.substr(0, input_processed + n + 33) + "</span>" + s.substr(input_processed + n + 33);
  }
  input_processed += n;
  $('#stdin_highlight').html(s);
  $('#stdin_highlight').animate({
    scrollTop: ($('#highlight_input').text().match(/\n/g) || []).length * parseInt($('#highlight_input').css('line-height'))
  }, 500);
  return time = 1000;
};

define_variable = function(type, scp, name, val, mem) {
  var id, panel;
  id = scp + "-" + name;
  panel = '<div class="panel panel-success" id="' + id + '" style="display:none;"><div class="panel-heading"> <h3 class="panel-title">' + name + "\t|\t" + type + '</h3></div> <div id="' + id + '-body" class="panel-body ' + mem + '-mem">' + val + '</div></div>';
  $('#' + scp + '-body').append(panel);
  $('#' + id).show(400);
  return time = 1000;
};

highlight_line = function(line_num) {
  console.log(marker);
  console.log("HERE");
  editor.getSession().removeMarker(marker);
  require(["ace/range"], function(range) {
    return marker = editor.getSession().addMarker(new range.Range(line_num, 0, line_num, 2000), "highlight-line", "line", true);
  });
  return time = 10;
};

reset = function() {
  $('#reset').switchClass('btn-primary', 'btn-success');
  $('#reset').text('Success');
  window.setTimeout(function() {
    $('#reset').switchClass('btn-success', 'btn-primary', 700);
    return $('#reset').text('Reset');
  }, 2000);
  cmd_number = 0;
  editor.getSession().removeMarker(marker);
  window.clearTimeout(curRunning);
  $('#stdin').prop('disabled', false);
  $('#stdin').show();
  $('#stdin_highlight').hide();
  editor.setReadOnly(false);
  $('#stdout').val(prev_out);
  console.log("PREV TEXT " + prev_out);
  return delete_scope('global');
};

update_variable = function(id, val) {
  var variable;
  variable = $('#' + id + '-body');
  variable.text(val);
  variable = $('.' + id + '-mem');
  variable.text(val);
  return time = 1000;
};

create_scope = function(scp, id) {
  var l, panel;
  l = $('.var').length;
  panel = '<div class="panel panel-warning" id="' + id + '" style="display:none;"> <div class="panel-heading"><h3 class="panel-title">' + id + '</h3></div> <div class="panel-body" id="' + id + '-body"></div></div>';
  $('#' + scp + '-body').append(panel);
  $('#' + id).show(400);
  return time = 1000;
};

delete_scope = function(id) {
  $('#' + id).hide('slow', function() {
    return $('#' + id).remove();
  });
  return time = 1000;
};

$('#ace1').ready(function() {
  editor.resize(true);
  editor.setTheme("ace/theme/dawn");
  editor.getSession().setMode("ace/mode/c_cpp");
  editor.setAutoScrollEditorIntoView(true);
  editor.setHighlightActiveLine(true);
  editor.setShowPrintMargin(false);
  return editor.setOptions({
    fontFamily: "Source Code Pro"
  }, "monospace");
});

createAlert = function(name, str, type) {
  var err;
  err = '<div class="alert alert-' + type + ' ' + 'alert-dismissible fade in" role="alert"> <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span></button> <strong>' + name + '\n</strong>' + str + '</div>';
  return $('#sbt-row').after(err);
};

clearAll = function() {
  $('#stdout').val("");
  return $('.alert').alert('close');
};

simulate = function() {
  eval(cmd[cmd_number]);
  cmd_number += 1;
  if (cmd_number === cmd.length) {
    cmd_number = 0;
    editor.getSession().removeMarker(marker);
    $('#stdin').prop('disabled', false);
    editor.setReadOnly(false);
    $('#stdin').show();
    return $('#stdin_highlight').hide();
  } else {
    return curRunning = window.setTimeout(simulate, time * scale);
  }
};

start_sim = function(obj) {
  cmd_number = 0;
  if (obj.gcc_error) {
    createAlert("GCC ERROR: ", obj.gcc_error, "danger");
    editor.setReadOnly(false);
  }
  if (obj.gcc_warning) {
    createAlert("GCC Warning: ", obj.gcc_warning, "warning");
  }
  if (obj.gcc_out === obj.its_out) {
    createAlert("", "Simulation made successfully!", "success");
    cmd = obj.its_cmd.split("\n");
    console.log(cmd);
    return simulate();
  }
};

compile = function() {
  var code, input;
  clearAll();
  $('#submit-btn').text('Loading...');
  $('#submit-btn').addClass('active');
  $('#stdin').prop('disabled', true);
  editor.setReadOnly(true);
  code = editor.getValue();
  input = $('#stdin').val();
  $('#stdin').hide();
  $('#stdin_highlight').show();
  $('#stdin_highlight').height($('#stdout').height());
  $('#stdin_highlight').html("<samp>" + input + "</samp>");
  code = window.btoa(code);
  input = window.btoa(input);
  $('#sbt_row .btn').button('toggle');
  return $.get("php/compile.php", {
    "code": code,
    "input": input
  }, function(json_text) {
    var obj;
    $('#submit-btn').text('Submit');
    $('#submit-btn').removeClass('active');
    obj = JSON.parse(json_text);
    prev_out = obj.gcc_out;
    console.log(obj);
    return start_sim(obj);
  });
};

$(function() {
  return $("#pause").button();
});
