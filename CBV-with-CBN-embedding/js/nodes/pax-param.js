class PaxParam extends Aux {

	constructor(name) {
		super(null, "¿", name);
	}

	copy() {
		return new PaxParam(this.name);
	}
	
}