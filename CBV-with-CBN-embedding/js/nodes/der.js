define(function(require) {

	var Expo = require('nodes/expo');

	class Der extends Expo {

		constructor(name) {
			super(null, "D", name);
		}

		copy() {
			var der = new Der(this.name);
			der.text = this.text;
			return der;
		}
	}

	return Der;
});