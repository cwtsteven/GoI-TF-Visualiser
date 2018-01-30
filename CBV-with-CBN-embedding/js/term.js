// specific group for a term in the calculus
class Term extends Group {

	constructor(prin, auxs, pAuxs) {
		super();
		this.set(prin, auxs, pAuxs)
	}

	set(prin, auxs, pAuxs){
		this.prin = prin;
		this.auxs = auxs;
		this.pAuxs = pAuxs;
		return this;
	}

	createPaxsOnTopOf(auxs) {
		var newPaxs = [];
		for (let pax of auxs) {
			var newPax = new Pax(pax.name).addToGroup(this);
			
			if (pax.findLinksOutOf(null).length == 0)
				new Link(pax.key, newPax.key, "n", "s").addToGroup(this);
			else {
				var outLink = pax.findLinksOutOf(null)[0];
				new Link(newPax.key, outLink.to, "n", outLink.toPort).addToGroup(this.group);
				outLink.changeTo(newPax.key, "s");
				outLink.changeToGroup(this);
			}
			newPaxs.push(newPax);
		}
		return newPaxs;
	}

	createPaxsPOnTopOf(pAuxs) {
		var newPaxs = [];
		for (let pAux of pAuxs) {
			var newPax = new PaxParam(pAux.name).addToGroup(this);

			var outLink = pAux.findLinksOutOf(null)[0];
			outLink.changeToGroup(this.group);
			this.graph.findNodeByKey(outLink.to).changeToGroup(this.group);

			var inLink = pAux.findLinksInto(null)[0]
			inLink.changeTo(newPax.key, 's');
			inLink.changeToGroup(this);

			pAux.changeToGroup(this.group);

			new Link(newPax.key, pAux.key, "n", "s").addToGroup(this.group);
			newPaxs.push(newPax);
		}
		return newPaxs;
	}

	createPaxsPOnTopOf2(pAuxs) {
		var newPaxs = [];
		for (let pAux of pAuxs) {
			var newPax = new PaxParam(pAux.name).addToGroup(this);

			var outLink = pAux.findLinksOutOf(null)[0];
			//this.graph.findNodeByKey(outLink.to).changeToGroup(this.group);
			outLink.changeFrom(newPax.key, 'n');
			outLink.changeToGroup(this.group);

			new Link(pAux.key, newPax.key, "n", "s").addToGroup(this);
			newPaxs.push(newPax);
		}
		return newPaxs;
	}

	static joinAuxs(leftAuxs, rightAuxs, group) {
		var newAuxs = leftAuxs.concat(rightAuxs);
		outter:
		for (let leftAux of leftAuxs) {
			for(let rightAux of rightAuxs) {
				if (leftAux.name == rightAux.name) {
					var con = new Contract(leftAux.name).addToGroup(group);
					if (leftAux instanceof PaxParam)
						con.text = "Ɔ";

					var outLink = leftAux.findLinksOutOf(null)[0];
					if (typeof outLink != 'undefined') {
						outLink.changeFrom(con.key, outLink.fromPort);
					}

					new Link(rightAux.key, con.key, "n", "s").addToGroup(group);
					new Link(leftAux.key, con.key, "n", "s").addToGroup(group);
					newAuxs.splice(newAuxs.indexOf(leftAux), 1);
					newAuxs.splice(newAuxs.indexOf(rightAux), 1);
					newAuxs.push(con);

					continue outter;
				}
			}
		}
		return newAuxs;
	}
}

// !-box 
class BoxWrapper extends Term {

	constructor(prin, box, auxs, pAuxs) {
		super(prin, auxs, pAuxs);
		this.box = box;
	}

	static create() {
		var wrapper = new BoxWrapper();
		var box = new Box().addToGroup(wrapper);
		var promo = new Promo().addToGroup(wrapper);
		wrapper.set(promo, box, [], []);
		return wrapper;
	}

	set(prin, box, auxs, pAuxs) {
		super.set(prin, auxs, pAuxs);
		this.box = box;
	}

	removeAux(aux) {
		this.auxs.splice(this.auxs.indexOf(aux), 1);
		aux.deleteAndPreserveOutLink();
	}

	removePaux(aux) {
		this.pAuxs.splice(this.pAuxs.indexOf(aux), 1);
		aux.deleteAndPreserveOutLink();
	}

	moveOut() {
		for (let link of Array.from(this.box.links)) {
			link.changeToGroup(this.group);
		}
		for (let link of Array.from(this.links)) {
			link.changeToGroup(this.group);
		}
		for (let node of Array.from(this.box.nodes)) {
			node.changeToGroup(this.group);
		}
		for (let aux of Array.from(this.auxs)) {
			aux.changeToGroup(this.group);
		}
		for (let aux of Array.from(this.pAuxs)) {
			aux.changeToGroup(this.group);
		}
		this.prin.changeToGroup(this.group);
		for (let node of Array.from(this.nodes)) {
			node.changeToGroup(this.group);
		}
	}

	copyBox(map) {
		var newBoxWrapper = new BoxWrapper();
		var newPrin = this.prin.copy().addToGroup(newBoxWrapper);
		newBoxWrapper.prin = newPrin;
		map.set(this.prin.key, newPrin.key);

		var newBox = new Box().addToGroup(newBoxWrapper);
		newBoxWrapper.box = newBox;

		newBoxWrapper.auxs = [];
		newBoxWrapper.pAuxs = [];
		for (let node of this.box.nodes) {
			var newNode;
			if (node instanceof BoxWrapper) {
				newNode = node.copyBox(map).addToGroup(newBox);
			}
			else {
				var newNode = node.copy().addToGroup(newBox);
				map.set(node.key, newNode.key);
			}
		}
		for (let aux of this.auxs) {
			var newAux = aux.copy().addToGroup(newBoxWrapper);
			newBoxWrapper.auxs.push(newAux);
			map.set(aux.key, newAux.key);
		}
		for (let aux of this.pAuxs) {
			var newAux = aux.copy().addToGroup(newBoxWrapper);
			newBoxWrapper.pAuxs.push(newAux);
			map.set(aux.key, newAux.key);
		}

		for (let link of this.box.links) {
			var newLink = new Link(map.get(link.from), map.get(link.to), link.fromPort, link.toPort).addToGroup(newBox);
			newLink.reverse = link.reverse;
			var fromNode = this.graph.findNodeByKey(link.from);
			if (fromNode instanceof Vec) {
				var i = fromNode.outLinks.indexOf(link);
				this.graph.findNodeByKey(map.get(fromNode.key)).outLinks[i] = newLink;
			}
			var toNode = this.graph.findNodeByKey(link.to);
			if (toNode instanceof VecMatch) {
				var i = toNode.inLinks.indexOf(link);
				this.graph.findNodeByKey(map.get(toNode.key)).inLinks[i] = newLink;
			}
		}
		for (let link of this.links) {
			var newLink = new Link(map.get(link.from), map.get(link.to), link.fromPort, link.toPort).addToGroup(newBoxWrapper);
			newLink.reverse = link.reverse;
		}

		return newBoxWrapper;
	}

	copy() {
		var map = new Map();
		return this.copyBox(map);
	}

	delete() {
		this.box.delete();
		for (let aux of Array.from(this.auxs)) {
			aux.delete();
		}
		for (let aux of Array.from(this.pAuxs)) {
			aux.delete();
		}
		this.prin.delete();
		super.delete();
	}

	deleteAndPreserveLink() {
		this.box.delete();
		for (let aux of Array.from(this.auxs)) {
			this.removeAux(aux); // preserve outLink
		}
		for (let aux of Array.from(this.pAuxs)) {
			this.removePaux(aux); // preserve outLink
		}
		this.prin.deleteAndPreserveInLink(); //preserve inLink
		super.delete();
	}

	draw(level) {
		var str = "";
		
		for (let node of this.nodes) {
			str += node.draw(level);
		}
		
		return str;
	}
}