class Promo extends Expo {

	constructor() {
		super(null, "!");
	}

	transition(token, link) {
		if (link.to == this.key) {
			token.rewriteFlag = RewriteFlag.F_PROMO_O;
			return this.findLinksOutOf(null)[0];
		}
		else if (link.from == this.key) {
			return this.findLinksInto(null)[0];
		}
	}

	rewrite(token, nextLink) {
		if (token.rewriteFlag == RewriteFlag.F_PROMO_O && nextLink.from == this.key) {
			this.openRewrite();
			token.rewriteFlag = RewriteFlag.F_PROMO_C;
			token.rewrite = true;
			return nextLink;
		}

		else if (token.rewriteFlag == RewriteFlag.F_PROMO_C && nextLink.from == this.key) {
			var prev = this.graph.findNodeByKey(this.findLinksInto(null)[0].from);

			if (prev instanceof Der) {
				token.rewriteFlag = RewriteFlag.EMPTY;
				var oldGroup = this.group;
				oldGroup.moveOut(); // this.group is a box-wrapper
				oldGroup.deleteAndPreserveLink();
				var newNextLink = prev.findLinksInto(null)[0];
				prev.deleteAndPreserveInLink(); // preserve inLink
				token.rewrite = true;
				return newNextLink;	
			}
			else if (prev instanceof Contract && token.boxStack.length >= 1) {
				if (token.boxStack.length >= 2) {
					var j = token.boxStack.last();
					var prev2 = this.graph.findNodeByKey(j.from);
					if (prev2 instanceof Contract) {
						token.boxStack.pop();
						var i = token.boxStack.last();
						for (let link of prev2.findLinksInto(null)) {
							link.to = prev.key;
						}
						prev2.delete();
						token.rewrite = true;
						return nextLink;
					}
				}

				else {
					var cons = new Array();
					for (var i=0;i<this.group.pAuxs.length;i++) {
						var con = new Contract().addToGroup(this.group.group);
						con.text = "Ɔ";
						new Link(con.key, this.group.pAuxs[i].key, 'n', 's').addToGroup(this.group.group);
						cons.push(con);
					}
					
					var link = token.boxStack.pop();
					var inLinks = prev.findLinksInto(null);
					for (var i=0;i<inLinks.length;i++) {
						if (inLinks[i] != link) {
							var newBoxWrapper = this.group.copy().addToGroup(this.group.group);
							for (var i=0;i<newBoxWrapper.pAuxs.length;i++) {
								new Link(newBoxWrapper.pAuxs[i].key, cons[i].key, 'n', 's').addToGroup(this.group.group);
							}
							inLinks[i].changeTo(newBoxWrapper.prin.key, "s");
						}
						else {
							for (var i=0;i<this.group.pAuxs.length;i++) {
								this.group.pAuxs[i].findLinksOutOf(null)[0].changeTo(cons[i].key, "s");
							}
							inLinks[i].changeTo(this.group.prin.key, "s");
						}
						
					}
					prev.delete();
					token.rewrite = true;
					return nextLink;	
				}
			}
			else {
				token.rewriteFlag = RewriteFlag.EMPTY;
				token.rewrite = true;
				return nextLink;	
			}
		}
		
		else if (token.rewriteFlag == RewriteFlag.EMPTY) {
			token.rewrite = false;
			return nextLink;
		}
	}

	openRewrite() {
		var boxWrapper = this.group;
		for (let pax of boxWrapper.auxs) {
			// Deep
			var nextPromo = this.searchForPromo(pax);
			nextPromo.openRewrite();
			// Step I
			var prev = this.graph.findNodeByKey(nextPromo.findLinksInto(null)[0].from);
			while (prev instanceof Contract || prev instanceof VecMatch || prev instanceof Abduct) {
				if (prev instanceof Contract) {
					var cons = [];
					for (var i=0; i<nextPromo.group.pAuxs.length; i++) {
						var con = new Contract(pax.name).addToGroup(nextPromo.group.group);
						con.text = "Ɔ";
						cons.push(con);
						nextPromo.group.pAuxs[i].findLinksOutOf(null)[0].changeFrom(con.key, 'n');
					}
					for (let link of prev.findLinksInto(null)) {
						var newBox = nextPromo.group.copy().addToGroup(nextPromo.group.group);
						link.changeTo(newBox.prin.key, 's');
						for (var i=0; i<newBox.pAuxs.length; i++) {
							new Link(newBox.pAuxs[i].key, cons[i].key, "n", "s").addToGroup(nextPromo.group.group);
						}
					}
					nextPromo.group.delete();
					prev.delete();
				}
				else if (prev instanceof VecMatch) {
					var cons = [];
					for (var i=0; i<nextPromo.group.pAuxs.length; i++) {
						var con = new Contract(pax.name).addToGroup(nextPromo.group.group);
						con.text = "Ɔ";
						cons.push(con);
						nextPromo.group.pAuxs[i].findLinksOutOf(null)[0].changeFrom(con.key, 'n');
					}

					for (var i=0; i<prev.inLinks.length; i++) {
						var newBox = nextPromo.group.copy().addToGroup(nextPromo.group.group);
						var e = new Vec(Vector.generateBaseVector(prev.inLinks.length, i)).addToGroup(newBox.box);
						var dot = VecBinOp.createDot().addToGroup(newBox.box);
						dot.subType = BinOpType.VecDot;
						new Link(dot.key, e.key, "e", "s").addToGroup(newBox.box);
						var promoLink = newBox.prin.findLinksOutOf(null)[0];
						promoLink.changeFrom(dot.key, 'w');
						promoLink.changeToGroup(newBox.box);
						new Link(newBox.prin.key, dot.key, "n", "s").addToGroup(newBox);
						prev.inLinks[i].changeTo(newBox.prin.key, 's');
						for (var j=0; j<newBox.pAuxs.length; j++) {
							new Link(newBox.pAuxs[j].key, cons[j].key, "n", "s").addToGroup(nextPromo.group.group);
						}
					}
					nextPromo.group.delete();
					prev.delete();
				}
				else if (prev instanceof Abduct) {
					nextPromo.abduct(prev);
				}
				nextPromo = this.searchForPromo(pax);
				prev = this.graph.findNodeByKey(nextPromo.findLinksInto(null)[0].from);
			}

			// Step II
			var nextNode = this.graph.findNodeByKey(pax.findLinksOutOf(null)[0].to);
			if (nextNode instanceof Promo) {
				nextNode.group.changeToGroup(pax.group.box); 

				pax.group.auxs = pax.group.auxs.concat(pax.group.createPaxsOnTopOf(nextNode.group.auxs));
				pax.group.pAuxs = pax.group.pAuxs.concat(pax.group.createPaxsPOnTopOf2(nextNode.group.pAuxs));
				var outLink = pax.findLinksOutOf(null)[0];
				outLink.changeToGroup(pax.group.box);
				pax.group.removeAux(pax); // preserve outLink
			}
		}
	}

	searchForPromo(node) {
		if (node instanceof Promo)
			return node;
		else {
			var link = node.findLinksOutOf(null);
			return this.searchForPromo(this.graph.findNodeByKey(link[0].to));
		}
	}

	abduct(prev) {
		var boxWrapper = this.group;
		var promoWrapper = BoxWrapper.create().addToGroup(boxWrapper.group);
		var promoBox = promoWrapper.box;
		var promo = promoWrapper.prin;

		var abs = new Abs().addToGroup(promoBox);
		new Link(promo.key, abs.key, "n", "s").addToGroup(promoWrapper);
		var der = new Der().addToGroup(promoBox);
		new Link(abs.key, der.key, "e", "s").addToGroup(promoBox);
		boxWrapper.changeToGroup(promoBox);
		var prevLink = boxWrapper.prin.findLinksInto(null)[0];
		prevLink.changeFrom(der.key, 'n');
		prevLink.changeToGroup(promoBox);
		var vecMatch = new VecMatch().addToGroup(promoBox);
		new Link(vecMatch.key, abs.key, "nw", "w").addToGroup(promoBox).reverse = true;

		var params = [];
		var values = new Vector();
		var map = new Map();
		for (let pax of Array.from(boxWrapper.pAuxs)) { //} boxWrapper.connectedPauxs()) {
			boxWrapper.pAuxs.splice(boxWrapper.pAuxs.indexOf(pax), 1);
			var outLink = pax.findLinksOutOf(null)[0];
			//var weak = new Weak(pax.name).addToGroup(this.graph.child);
			var weak = new Weak(pax.name).addToGroup(this.group.group.group.group);
			weak.text = "Ɔ0";
			map.set(weak.key, pax.key);
			outLink.changeFrom(weak.key, 'n');
			var param = this.searchForParam(weak, weak, promoBox, map, vecMatch, params, values);
			this.changePauxToAux(pax);
			//this.deletePaxFromOutterGroup(weak);
		}
		vecMatch.text = "P" + vecMatch.inLinks.length;
		promoWrapper.pAuxs = promoWrapper.createPaxsPOnTopOf(boxWrapper.pAuxs);

		var newBoxWrapper = BoxWrapper.create().addToGroup(boxWrapper.group);
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
		if (node instanceof PaxParam || node instanceof Weak) {
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
		else if (node instanceof Param) {
			if (params.indexOf(nextNode) == -1) {
				params.push(nextNode);
				values.push(nextNode.name);
				var link = new Link(map.get(prevNode.key), vecMatch.key, "n", "s").addToGroup(targetBox);
				vecMatch.inLinks.push(link);
			}
			return nextNode; // return the whole term
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

	deletePaxFromOutterGroup(node) {
		if (node instanceof Weak) {
			var outLink = node.findLinksOutOf(null)[0];
			this.deletePaxFromOutterGroup(this.graph.findNodeByKey(outLink.to));
		}
		else if (node instanceof PaxParam) {
			var outLink = node.findLinksOutOf(null)[0];
			node.group.pAuxs.splice(node.group.pAuxs.indexOf(node), 1);
			node.deleteAndPreserveOutLink();
			this.deletePaxFromOutterGroup(this.graph.findNodeByKey(outLink.to));
		}
	}

	copy() {
		return new Promo();
	}
}