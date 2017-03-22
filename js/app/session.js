'use strict';

define('session', function(require) {
  var MINI = require('minified');
  var _=MINI._, $=MINI.$, $$=MINI.$$, EE=MINI.EE, HTML=MINI.HTML;

  var types = [
    'Drive',
    'Event',
    'Reaction'
  ];

  var $start = $('#start')
    , $events = $('#events');

  var date_format = 'n d, y h:mm:ss a';

  function Session(started, data) {
    data = data ? JSON.parse(data) : {
      name: '',
      groups: [],
      events: []
    };
    this.started = started ? new Date(1*started) : null;
    this.name = data.name;
    this.groups = data.groups;
    this.events = data.events;
    this.key_down = false;
    this.formatEvent = this.formatEvent.bind(this);

    if (this.started) {
      this.title = _.formatValue(date_format, this.started);
      if (this.name) {
        this.title += ' - '+this.name;
      }
    }

    return this;
  }

  Session.prototype.render = function() {
    var i;

    $start.fill(this.title);

    $events.fill();
    for (i = 0; i < this.events.length; i++) {
      this.render_event(this.events[i], i);
    }
  };

  Session.prototype.render_event = function(event, i) {
    $events.addFront(EE('li', this.formatEvent(event, i)));
  };

  Session.prototype.formatEvent = function(event, i) {
    var ms = 1*event[0]
      , type = types[event[1]] || 'Start';

    if (!event[1] && typeof(i) == 'number') {
      type += ' '+(this.groups.indexOf(i-1)+1);
    }

    return formatEventTime(ms)+' '+type;
  };

  function formatEventTime (ms) {
    return _.formatValue('00', Math.floor(ms / 36e5) % 24) + ':' +
      _.formatValue('00', Math.floor(ms / 6e4) % 60) + ':' +
      _.formatValue('00', Math.floor(ms / 1e3) % 60) + '.' +
      _.formatValue('000', ms % 1000);
  }

  Session.prototype.start = function() {
    if (!this.started) {
      this.started = new Date();
      this.title = _.formatValue(date_format, this.started);
      this.render();
      this.save();
      localStorage.current = this.started.getTime();
    }
  };

  Session.prototype.stop = function() {
    var name;

    if (this.started) {
      localStorage.current = '';
      $start.fill();
      $events.fill();
      if (!this.events.length) {
        localStorage.removeItem(this.started.getTime());
      } else {
        name = prompt('PID:');
        if (name !== null) {
          this.name = name;
          if (this.name) {
            this.title += ' - '+this.name;
          }
          this.save();
          this.download();
        }
      }
    }
  };

  Session.prototype.abort = function() {
    localStorage.removeItem(this.started.getTime());
    localStorage.current = '';
    $start.fill();
    $events.fill();
  };

  Session.prototype.new_event = function(type) {
    var time, event;

    if (this.started) {
      time = new Date() - this.started;
      event = [time, type];
      this.events.push(event);
      this.save();
      this.render_event(event, this.events.length);
    }
  };

  Session.prototype.new_group = function(event) {
    if (!this.key_down) {
      this.groups.push(this.events.length);
      this.new_event(0);
    }
    this.key_down = true;
    event.preventDefault();
  };

  Session.prototype.event_start = function(event) {
    if (this.groups.length && !this.key_down) {
      this.new_event(1);
    }
    this.key_down = true;
    event.preventDefault();
  };

  Session.prototype.mark = function(event) {
    if (this.groups.length && !this.key_down) {
      this.new_event(2);
    }
    this.key_down = true;
    event.preventDefault();
  };

  Session.prototype.key_release = function() {
    this.key_down = false;
  };

  Session.prototype.save = function() {
    localStorage[this.started.getTime()] = JSON.stringify({
      name: this.name,
      groups: this.groups,
      events: this.events
    });
  };

  Session.prototype.download = function () {
    this.download_csv();
    this.download_list();
  };

  Session.prototype.download_list = function() {
    var contents = [[0,-1]].concat(this.events).map(this.formatEvent).join('\r\n')
      , filename = _.formatValue('y-m-d_H-m-s', this.started) +
          (this.name ? '_'+this.name : '');

    contents = new Blob([contents], {type: 'text/plain;charset=utf-8'});
    saveAs(contents, filename+'.txt', true);
  };

  Session.prototype.download_csv = function() {
    var contents = ['PID,Drive,Event1,Event2,Event3,Event4,FalseNeg,FalsePos']
      , filename = _.formatValue('y-m-d_H-m-s', this.started) +
          (this.name ? '_'+this.name : '')
      , row, group, i, j, prev_event, fp, fn;

    for (i = 0; i < this.groups.length; i++) {
      group = this.groups[i];
      row = [this.name, i + 1];
      prev_event = null;
      fp = 0;
      fn = 0;
      for (j = group + 1; j < this.events.length && this.events[j][1]; j++) {
        if (this.events[j][1] == 1) {
          if (prev_event) {
            // False Negative
            fn++;
            row.push('');
          }
          prev_event = 1*this.events[j][0];
        } else {
          if (!prev_event) {
            // False Positive
            fp++;
          } else {
            row.push((1*this.events[j][0] - prev_event)/1000);
            prev_event = null;
          }
        }
      }
      if (prev_event) {
        // False Negative
        fn++;
      }
      while (row.length < 6) {
        row.push('');
      }
      row.push(fn);
      row.push(fp);
      contents.push(row.join(','));
    }

    contents = new Blob([contents.join('\r\n')], {type: 'text/csv;charset=utf-8'});
    saveAs(contents, filename+'.csv', true);
  };

  return Session;

});
