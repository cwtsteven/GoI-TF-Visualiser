define('nodes/vector', function(require) {

	class Vector extends Array {

		toString() {
			return '[' + super.toString() + ']';
		}

		static fromArray(arr) {
			var vec = new Vector();
			for (var i=0; i<arr.length; i++) {
				vec[i] = arr[i];
			}
			return vec;
		}

		static generateBaseVector(size, i) {
			var vector = Vector.fromArray(new Array(size).fill(0));
			vector[i] = 1;
			return vector;
		}
	}

	return Vector;
});

define('nodes/vec', function(require) {

	var Const = require('nodes/const');

	class Vec extends Const {

		constructor(name) {
			super(name);
		}

		copy() {
			return new Vec(this.name);
		}
	}

	return Vec;
});