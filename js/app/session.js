'use strict';

define('session', function(require){
  var MINI = require('minified');
  var _=MINI._, $=MINI.$, $$=MINI.$$, EE=MINI.EE, HTML=MINI.HTML;

  var $start = $('#start')
    , $events = $('#events');

  var date_format = 'n d, y h:mm:ss a';

  function Session(started, data){
    data = data ? JSON.parse(data) : { name: '', events: [] };
    this.started = started ? new Date(1*started) : null;
    this.name = data.name;
    this.events = data.events;
    this.mark_down = false;

    if(this.started){
      this.title = _.formatValue(date_format, this.started);
      if(this.name){
        this.title += ' - '+this.name;
      }
    }

    return this;
  }

  Session.prototype.render = function(){
    var i;

    $start.fill(this.title);

    $events.fill();
    for(i = 0; i < this.events.length; i++){
      this.render_mark(this.events[i]);
    }
  };

  Session.prototype.render_mark = function(time){
    $events.addFront(EE('li', this.formatEvent(time)));
  };

  Session.prototype.formatEvent = function(ms, i){
    ms *= 1;
    return _.formatValue('00', Math.floor(ms / 36e5) % 24) + ':' +
      _.formatValue('00', Math.floor(ms / 6e4) % 60) + ':' +
      _.formatValue('00', Math.floor(ms / 1e3) % 60) + '.' +
      _.formatValue('000', ms % 1000) + (typeof(i) == 'undefined' ? '' : ' '+i);
  };

  Session.prototype.start = function(){
    if(!this.started){
      this.started = new Date();
      this.title = _.formatValue(date_format, this.started);
      this.render();
      this.save();
      localStorage.current = this.started.getTime();
    }
  };

  Session.prototype.stop = function(){
    var name;

    if(this.started){
      localStorage.current = '';
      $start.fill();
      $events.fill();
      if(!this.events.length){
        localStorage.removeItem(this.started.getTime());
      }else{
        name = prompt('Session name:');
        if(name !== null){
          this.name = name;
          if(this.name){
            this.title += ' - '+this.name;
          }
          this.save();
          this.download();
        }
      }
    }
  };

  Session.prototype.abort = function(){
    localStorage.removeItem(this.started.getTime());
    localStorage.current = '';
    $start.fill();
    $events.fill();
  };

  Session.prototype.mark = function(){
    var time;

    if(!this.mark_down && this.started){
      time = new Date() - this.started;
      this.events.push(time);
      this.save();
      this.render_mark(time);
      event.preventDefault();
    }
    this.mark_down = true;
  };

  Session.prototype.mark_release = function(){
    this.mark_down = false;
  };

  Session.prototype.save = function(){
    localStorage[this.started.getTime()] = JSON.stringify({
      name: this.name,
      events: this.events
    });
  };

  Session.prototype.download = function(){
    var contents = [0].concat(this.events).map(this.formatEvent).join('\r\n')
      , filename = _.formatValue('y-m-d_H-m-s', this.started) +
          (this.name ? '_'+this.name : '');

    contents = new Blob([contents], {type: 'text/plain;charset=utf-8'});
    saveAs(contents, filename+'.txt', true);
  };

  return Session;

});
