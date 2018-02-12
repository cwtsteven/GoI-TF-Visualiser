define(function(require) {
	var Node = require('node');
	var Link = require('link');
	var CompData = require('token').CompData;
	var RewriteFlag = require('token').RewriteFlag;
	var Weak = require('nodes/weak');
	var Der = require('nodes/der');
	var Vec = require('nodes/vec');	
	var Vector = require('nodes/vector');
	var App = require('nodes/app');
	var Contract = require('nodes/contract');
	var Term = require('term');

	class Fold extends Node {

		constructor() {
			super(null, 'F', null);
		}

		transition(token, link) {
			if (link.to == this.key) {
				token.dataStack.push(CompData.PROMPT);
				return this.findLinksOutOf("e")[0];
			}
			else if (link.from == this.key && link.fromPort == "e") {
				token.dataStack.push(CompData.PROMPT);
				token.forward = true;
				return this.findLinksOutOf("w")[0];
			}
			else if (link.from == this.key && link.fromPort == "w") {
				if (token.dataStack.last() == CompData.LAMBDA) {
					token.dataStack.pop();
					var vec = token.dataStack.pop();

					token.rewriteFlag = RewriteFlag.F_FOLD + '(' + vec.length + ')';
					//token.forward = true;
					return this.findLinksInto(null)[0];
				}
			}
		}

		rewrite(token, nextLink) {
			console.log(token);
			if (token.rewriteFlag.substring(0,3) == RewriteFlag.F_FOLD && nextLink.to == this.key) {
				var n = parseInt(token.rewriteFlag.substring(4, token.rewriteFlag.length-1));

				token.rewriteFlag = RewriteFlag.EMPTY;

				var left = this.graph.findNodeByKey(this.findLinksOutOf("w")[0].to);
				var right = this.graph.findNodeByKey(this.findLinksOutOf("e")[0].to);

				if (n == 0) {
					var oldGroup = right.group;
					right.group.moveOut();
					oldGroup.deleteAndPreserveLink();
					var weak = new Weak(left.name).addToGroup(this.group);
					this.findLinksOutOf("w")[0].changeFrom(weak.key, 'n');
					var into = this.findLinksInto(null)[0];
					var east = this.findLinksOutOf("e")[0];
					east.changeFrom(into.from, into.fromPort);
					this.delete();

					token.rewrite = true;
					token.forward = true;
					return east;
				}

				else {
					var term = this.unfolding(n,n,right,this.group);
					new Link(term.auxs[0].key, left.key, 'n', 's').addToGroup(this.group);
					var into = this.findLinksInto(null)[0];
					into.changeTo(term.prin.key, "s");
					this.delete();

					token.rewrite = true;
					token.forward = true;
					return into;
				}
			}
			
			else if (token.rewriteFlag == RewriteFlag.EMPTY) {
				token.rewrite = false;
				return nextLink;
			}
		}

		unfolding(size, n, right, group) {
			var right;
			var auxs = new Array();

			var leftWrapper = BoxWrapper.create().addToGroup(group);
			var leftBox = leftWrapper.box;
			var leftPromo = leftWrapper.prin;
			var vector = Vector.generateBaseVector(size, (size-n));
			var vec = new Vec(vector).addToGroup(leftBox);
			new Link(leftPromo.key, vec.key, "n", "s").addToGroup(leftWrapper);

			var app = new App().addToGroup(group);

			var leftApp = new App().addToGroup(group);
			var leftDer = new Der().addToGroup(group);

			if (n == 1) {
				right = right; 
				right.group.changeToGroup(group); 
				auxs.push(leftDer); 
			}
			else {
				var promoWrapper = BoxWrapper.create().addToGroup(group);
				var promoBox = promoWrapper.box;
				var promo = promoWrapper.prin;
				var right = this.unfolding(size,n-1,right,promoBox);
				promoWrapper.set(promo, promoBox, promoWrapper.createPaxsOnTopOf(right.auxs), promoWrapper.createPaxsPOnTopOf(right.pAuxs));
				new Link(promo.key, right.prin.key, "n", "s").addToGroup(promoWrapper);
				right = promo;
				var con = new Contract(promoWrapper.auxs[0].name).addToGroup(group);
				new Link(leftDer.key, con.key, "n", "s").addToGroup(group);
				new Link(promoWrapper.auxs[0].key, con.key, "n", "s").addToGroup(group);
				auxs.push(con);
			}

			new Link(leftApp.key, leftPromo.key, "e", "s").addToGroup(group);
			new Link(leftApp.key, leftDer.key, "w", "s").addToGroup(group);

			new Link(app.key, leftApp.key, "w", "s").addToGroup(group); 
			new Link(app.key, right.key, "e", "s").addToGroup(group); 

			return new Term(app, auxs, right.group.pAuxs);
		}

		copy() {
			return new Fold();
		}
	}

	return Fold;
});