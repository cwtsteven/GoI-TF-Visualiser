class VecMatch extends Node {

	constructor() {
		super(null, "", null);
		this.inLinks = [];
	}
	
	copy() {
		var newNode = new VecMatch();
		newNode.text = this.text;
		return newNode;
	}

}