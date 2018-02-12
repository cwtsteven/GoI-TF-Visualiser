define('nodes/aux', function(require) {

	var Expo = require('nodes/expo');

	class Aux extends Expo {
		
	}

	return Aux;
});

define('nodes/pax', function(require) {

	var Aux = require('nodes/aux');

	class Pax extends Aux {

		constructor(name) {
			super(null, "?", name);
		}

		copy() {
			return new Pax(this.name);
		}
	}

	return Pax;
});