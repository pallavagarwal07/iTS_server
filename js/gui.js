var clearAll, cmd, cmd_number, compile, createAlert, create_scope, curRunning, custom_highlight, define_variable, delete_scope, getQuery, green, highlight_line, input_processed, marker, pause_simulation, prev_out, prev_scale, red, reset, scale, setCodeFromURL, simulate, speed, start_sim, stdin_write, stdout_print, step_forward, stop, time, update_variable, user_error;

this.resize_list = [];

stop = 0;

cmd_number = 0;

cmd = [];

prev_out = "";

marker = null;

curRunning = null;

time = 1000;

scale = 1;

input_processed = 0;

prev_scale = 1;

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

setCodeFromURL = function() {
  var code, inp;
  code = window.atob(getQuery('code'));
  inp = window.atob(getQuery('input'));
  $('#stdin').text(inp);
  return editor.setValue(code);
};

$(setCodeFromURL);

getQuery = function(variable) {
  var i, len, pair, query, term, vars;
  query = window.location.search.substring(1);
  vars = query.split('&');
  for (i = 0, len = vars.length; i < len; i++) {
    term = vars[i];
    pair = term.split('=');
    if (pair[0] === variable) {
      return pair[1];
    }
  }
  return '';
};

$(function() {
  return $('#pause').change(function() {
    if ($('#pause').prop('checked') === true) {
      $('#pause_label span').text("Play");
      $('#slider').slider("disable");
      $('#submit-btn').prop('disabled', false);
      $('#submit-btn').text('Step forward >>');
      prev_scale = scale;
      return window.clearTimeout(curRunning);
    } else {
      $('#submit-btn').prop('disabled', true);
      $('#pause_label span').text("Pause");
      $('#slider').slider("enable");
      scale = prev_scale;
      window.clearTimeout(curRunning);
      return simulate();
    }
  });
});

pause_simulation = function() {
  $('#pause').prop('checked', true);
  $('#pause').button('refresh');
  $('#pause_label span').text("Play");
  $('#slider').slider("disable");
  $('#submit-btn').prop('disabled', false);
  $('#submit-btn').text('Step forward >>');
  prev_scale = scale;
  window.clearTimeout(curRunning);
  return stop = "STOP";
};

$(function() {
  $('#stdout').text("");
  $('#stdin_highlight').hide();
  return $('#pause_label').css('height', $('#reset').css('height'));
});

user_error = function(b64error) {
  var error;
  error = window.atob(b64error);
  $('#modal-msg').html(error);
  $('#myModal').modal('show');
  return scale = 5000;
};

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
  editor.getSession().removeMarker(marker);
  require(["ace/range"], function(range) {
    return marker = editor.getSession().addMarker(new range.Range(line_num, 0, line_num, 2000), "highlight-line", "line", true);
  });
  return time = 10;
};

red = "red";

green = "green";

custom_highlight = function(line_num, color) {
  console.log(marker);
  editor.getSession().removeMarker(marker);
  require(["ace/range"], function(range) {
    if (color === green) {
      return marker = editor.getSession().addMarker(new range.Range(line_num, 0, line_num, 2000), "highlight-green", "line", true);
    } else if (color === red) {
      return marker = editor.getSession().addMarker(new range.Range(line_num, 0, line_num, 2000), "highlight-red", "line", true);
    }
  });
  return time = 400;
};

reset = function() {
  $('#pause_label span').text("Pause");
  $('#slider').slider("enable");
  scale = prev_scale;
  $('#submit-btn').prop('disabled', false);
  $('#submit-btn').text('Submit');
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
  return delete_scope('global');
};

$(reset);

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
  if (stop === "STOP") {
    stop = 0;
    return;
  }
  if (cmd_number === cmd.length) {
    return window.setTimeout(function() {
      cmd_number = 0;
      editor.getSession().removeMarker(marker);
      $('#stdin').prop('disabled', false);
      editor.setReadOnly(false);
      $('#stdin').show();
      return $('#stdin_highlight').hide();
    }, time * scale);
  } else {
    return curRunning = window.setTimeout(simulate, time * scale);
  }
};

step_forward = function() {
  var exe, flag, results;
  flag = 1;
  results = [];
  while (1) {
    exe = cmd[cmd_number];
    cmd_number += 1;
    if (cmd_number === cmd.length) {
      cmd_number = 0;
      window.setTimeout(function() {
        editor.getSession().removeMarker(marker);
        $('#stdin').prop('disabled', false);
        editor.setReadOnly(false);
        $('#stdin').show();
        return $('#stdin_highlight').hide();
      }, time * scale);
      break;
    }
    if (flag && exe.indexOf('highlight_line') === 0) {
      flag = 0;
      console.log('Evaluating ' + exe);
      results.push(eval(exe));
    } else {
      console.log("Here " + exe);
      if (exe.indexOf('highlight_line') === -1) {
        console.log('Evaluating ' + exe);
        results.push(eval(exe));
      } else {
        cmd_number -= 1;
        break;
      }
    }
  }
  return results;
};

start_sim = function(obj) {
  cmd_number = 0;
  if (obj.gcc_error) {
    createAlert("GCC ERROR: ", obj.gcc_error, "danger");
    return editor.setReadOnly(false);
  } else {
    if (obj.gcc_warning) {
      createAlert("GCC Warning: ", obj.gcc_warning, "warning");
    }
    if (obj.gcc_out === obj.its_out) {
      createAlert("", "Simulation made successfully!", "success");
      cmd = obj.its_cmd.split("\n");
      console.log(cmd);
      return simulate();
    } else {
      createAlert("", "GCC output, and the interpreter output were not the same.", "warning");
      cmd = obj.its_cmd.split("\n");
      console.log(cmd);
      return simulate();
    }
  }
};

compile = function() {
  var code, input;
  if ($('#submit-btn').text().trim() === 'Step forward >>') {
    step_forward();
  }
  if ($('#submit-btn').text().trim() === 'Submit') {
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
  }
};

$(function() {
  return $("#pause").button();
});

// ---
// generated by coffee-script 1.9.2
