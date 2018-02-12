define(function(require) {

	var CompData = require('token').CompData();
	var RewriteFlag = require('token').RewriteFlag();
	//var BoxWrapper = require('box-wrapper');
	var Link = require('link');
	var Expo = require('nodes/expo');
	var Der = require('nodes/der');
	var Contract = require('nodes/contract');
	var VecMatch = require('nodes/vec-match');
	var Abduct = require('nodes/abduct');
	var PaxParam = require('nodes/pax-param');
	var Weak = require('nodes/weak');
	var Vec = require('nodes/vec');
	var Vector = require('nodes/vector');
	var VecBinOp = require('nodes/vec-binop');
	var BinOpType = require('op').BinOpType;


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
						//nextPromo.abduct(prev);
						nextPromo.group.abduct(prev);
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

	//exports.Promo = Promo;
	return Promo;
});