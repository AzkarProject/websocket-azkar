var connection = new autobahn.Connection({
	url: 'ws://komcom.53js.fr',
	realm: 'com.azkar'
});

connection.onopen = function(session, details) {
	console.log('OPEN', session, details);
	$('body').addClass('komcom-connected');
	document.querySelector('kom-remote').start(session);
};

connection.onclose = function(reason, details) {
	console.log('CLOSE', reason, details);
	$('body').removeClass('komcom-connected');
	document.querySelector('kom-remote').destroy();
};

connection.open();
