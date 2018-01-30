class Contract extends Expo {

	constructor(name) {
		super(null, "C", name);
	}

	transition(token, link) {
		if (link.to == this.key) {
			token.boxStack.push(link);
			return this.findLinksOutOf(null)[0];
		}
		else if (link.from == this.key && token.boxStack.length > 0) {
			return token.boxStack.pop();
		}
	}

	copy() {
		var con = new Contract(this.name);
		con.text = this.text;
		return con;
	}
}