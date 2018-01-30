class Param extends Expo {

	constructor(name) {
		super(null, "¡", name);
	}

	copy() {
		var newNode = new Param(this.name);
		newNode.width = this.width;
		newNode.height = this.height;
		return newNode;
	}
	
}