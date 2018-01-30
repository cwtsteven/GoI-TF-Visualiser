class GC {

	constructor(graph) {
		this.graph = graph;
	}
	
	collect() {
		this.collectInGroup(this.graph.child);
	}

	collectInGroup(group) {
		for (let node of Array.from(group.nodes)) {
			if ((node instanceof Weak && node.text == "C0") || (node instanceof Contract && node.findLinksInto(null).length == 0)) {
				var nextNode = this.graph.findNodeByKey(node.findLinksOutOf(null)[0].to);
				if (nextNode instanceof Promo) {
					this.removeBox(nextNode.group);
					node.delete();
				}
				else if (nextNode instanceof Contract)
					node.delete();
			}
			else if (node instanceof Group) {
				this.collectInGroup(node);
			}
		}
	}

	removeBox(box) {
		for (let aux of Array.from(box.pAuxs)) {
			var weak = new Weak(aux.name).addToGroup(aux.group.group);
			weak.text = "Ɔ0";
			var outLink = aux.findLinksOutOf(null)[0];
			outLink.changeFrom(weak.key, 'n');
			box.removePaux(aux);
		}
		for (let aux of Array.from(box.auxs)) {
			var outLink = aux.findLinksOutOf(null)[0];
			var nextNode = this.graph.findNodeByKey(outLink.to);
			if (nextNode instanceof Promo)
				this.removeBox(nextNode.group);
			else 
				outLink.delete();
			box.removeAux(aux);
		}
		box.delete();
	}

}