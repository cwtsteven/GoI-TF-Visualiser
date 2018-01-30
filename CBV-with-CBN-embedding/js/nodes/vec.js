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

class Vec extends Const {

	constructor(name) {
		super(name);
	}

	copy() {
		return new Vec(this.name);
	}
}