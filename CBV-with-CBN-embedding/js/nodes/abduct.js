define(function(require) {
	var Node = require('node');

	class Abduct extends Node {

		constructor() {
			super(null, "A", null);
		}

		copy() {
			return new Abduct();
		}

	}

	return Abduct;
});