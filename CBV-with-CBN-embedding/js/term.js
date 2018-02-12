// specific group for a term in the calculus
define('term', function(require) {

	var Group = require('group');
	var Link = require('link');
	var Pax = require('nodes/pax');
	var PaxParam = require('nodes/pax-param');
	var Contract = require('nodes/contract');

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

	return Term;
});

define('box-wrapper', function(require) {

	var Link = require('link')
	var Term = require('term');
	var Box = require('box');
	var Promo = require('nodes/promo');
	var Vec = require('nodes/vec');
	var Vector = require('nodes/vector');
	var VecMatch = require('nodes/vec-match');
	var Abs = require('nodes/abs');
	var Der = require('nodes/der');
	var Contract = require('nodes/contract');
	var Weak = require('nodes/weak');
	var Param = require('nodes/parameter');
	var PaxParam = require('nodes/pax-param');
	var Pax = require('nodes/pax');

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

		abduct(prev) {
			var promoWrapper = BoxWrapper.create().addToGroup(this.group);
			var promoBox = promoWrapper.box;
			var promo = promoWrapper.prin;

			var abs = new Abs().addToGroup(promoBox);
			new Link(promo.key, abs.key, "n", "s").addToGroup(promoWrapper);
			var der = new Der().addToGroup(promoBox);
			new Link(abs.key, der.key, "e", "s").addToGroup(promoBox);
			this.changeToGroup(promoBox);
			var prevLink = this.prin.findLinksInto(null)[0];
			prevLink.changeFrom(der.key, 'n');
			prevLink.changeToGroup(promoBox);
			var vecMatch = new VecMatch().addToGroup(promoBox);
			new Link(vecMatch.key, abs.key, "nw", "w").addToGroup(promoBox).reverse = true;

			var params = [];
			var values = new Vector();
			var map = new Map();
			for (let pax of Array.from(this.pAuxs)) { //} this.connectedPauxs()) {
				this.pAuxs.splice(this.pAuxs.indexOf(pax), 1);
				var outLink = pax.findLinksOutOf(null)[0];
				//var weak = new Weak(pax.name).addToGroup(this.graph.child);
				var weak = new Weak(pax.name).addToGroup(this.group.group.group);
				weak.text = "Ɔ0";
				map.set(weak.key, pax.key);
				outLink.changeFrom(weak.key, 'n');
				var param = this.searchForParam(weak, weak, promoBox, map, vecMatch, params, values);
				this.changePauxToAux(pax);
				//this.deletePaxFromOutterGroup(weak);
			}
			vecMatch.text = "P" + vecMatch.inLinks.length;
			promoWrapper.pAuxs = promoWrapper.createPaxsPOnTopOf(this.pAuxs);

			var newBoxWrapper = BoxWrapper.create().addToGroup(this.group);
			var newBox = newBoxWrapper.box;
			var newPromo = newBoxWrapper.prin;
			var vec = new Vec(values).addToGroup(newBox);
			var newLink = new Link(newPromo.key, vec.key, "n", "s").addToGroup(newBoxWrapper);

			var leftLink = prev.findLinksInto("w")[0];
			var rightLink = prev.findLinksInto("e")[0];
			leftLink.changeTo(promo.key, 's');
			rightLink.changeTo(newPromo.key, 's');
			prev.delete();
		}

		searchForParam(prevNode, node, targetBox, map, vecMatch, params, values) {
			var nextNode = node.graph.findNodeByKey(node.findLinksOutOf(null)[0].to);
			if (node instanceof Param) {
				if (params.indexOf(nextNode) == -1) {
					params.push(nextNode);
					values.push(nextNode.name);
					var link = new Link(map.get(prevNode.key), vecMatch.key, "n", "s").addToGroup(targetBox);
					vecMatch.inLinks.push(link);
				}
				return nextNode; // return the whole term
			}
			else if (node instanceof PaxParam || node instanceof Weak) {
				return this.searchForParam(prevNode, nextNode, targetBox, map, vecMatch, params, values);
			}
			else if (node instanceof Contract) {
				if (!map.has(node.key)) {
					var newCon = new Contract(node.name).addToGroup(targetBox);
					map.set(node.key, newCon.key);
				}
				new Link(map.get(prevNode.key), map.get(node.key), "n", "s").addToGroup(targetBox);

				return this.searchForParam(node, nextNode, targetBox, map, vecMatch, params, values);
			}
		}

		changePauxToAux(node) {
			if (node instanceof PaxParam) {
				var pax = new Pax(node.name).addToGroup(node.group);
				var inLink = node.findLinksInto(null)[0];
				inLink.changeTo(pax.key, 's');
				node.findLinksOutOf(null)[0].changeFrom(pax.key, 'n');
				node.group.auxs.push(pax);
				node.group.pAuxs.splice(node.group.pAuxs.indexOf(node), 1);
				node.delete();
				this.changePauxToAux(this.graph.findNodeByKey(inLink.from));
			}
			else if (node instanceof Der) {
				node.text = "D";
				var inLink = node.findLinksInto(null)[0];
				this.changePauxToAux(this.graph.findNodeByKey(inLink.from));
			}
			else if (node instanceof Contract) {
				node.text = "C";
				for (let link of node.findLinksInto(null)) {
					this.changePauxToAux(this.graph.findNodeByKey(link.from));
				}
			}
			else if (node instanceof Weak) {
				node.text = "C0";
			}
			else 
				return;
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

	//exports.BoxWrapper = BoxWrapper;
	return BoxWrapper;
});