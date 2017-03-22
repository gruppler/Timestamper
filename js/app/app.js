'use strict';

var MINI = require('minified');
var _=MINI._, $=MINI.$, $$=MINI.$$, EE=MINI.EE, HTML=MINI.HTML;
var Session = require('session');

var keys = {
  clear: 88,      // X
  onoff: 16,      // Shift
  mark: 32,       // Space
  new_group: 78,  // N
  event_start: 69 // E
};


// if ('serviceWorker' in navigator) {
//   console.log('CLIENT: service worker registration in progress.');
//   navigator.serviceWorker.register('/service-worker.js').then(function() {
//     console.log('CLIENT: service worker registration complete.');
//   }, function() {
//     console.log('CLIENT: service worker registration failure.');
//   });
// } else {
//   console.log('CLIENT: service worker is not supported.');
// }


$(function() {
  var $sessions = $('#sessions')
    , sessions = []
    , session, i, key, li;

  function render_sessions() {
    $sessions.fill();
    for (key in sessions) {
      li = EE('li', sessions[key].title);
      li.onClick(_.bind(sessions[key].download, sessions[key]));
      $sessions.addFront(li);
    }
  }

  for (i = 0; i < localStorage.length; i++) {
    key = localStorage.key(i);
    if (key != 'current') {
      sessions[key] = new Session(key, localStorage[key]);
    }
  }

  if (localStorage.current) {
    session = sessions[localStorage.current];
  } else {
    session = new Session();
  }

  if (session.started) {
    session.render();
  } else {
    render_sessions();
  }

  $(window).on('keydown', function(event) {
    switch (event.which) {
      // Start
      case keys.onoff:
        $sessions.fill();
        session.start();
        break;
      // New Group
      case keys.new_group:
        session.new_group(event);
        break;
      // Event Start
      case keys.event_start:
        session.event_start(event);
        break;
      // Mark
      case keys.mark:
        session.mark(event);
        break;
      // Delete Everything
      case keys.clear:
        if (session.started) {
          if (confirm('Delete current session?')) {
            session.abort();
            delete sessions[session.started.getTime()];
            session = new Session();
            render_sessions();
          }
        } else {
          if (confirm('Delete all sessions?')) {
            localStorage.clear();
            location.reload();
          }
        }
        break;
      // default:
      //   console.log(event.which);
    }
  });

  $(window).on('keyup', function(event) {
    switch (event.which) {
      case keys.onoff:
        session.stop();
        if (session.events.length) {
          sessions[session.started.getTime()] = session;
        }
        session = new Session();
        render_sessions();
        break;
      case keys.new_group:
      case keys.event_start:
      case keys.mark:
        session.key_release();
        break;
    }
  });
});
