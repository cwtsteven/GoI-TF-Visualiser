var graph = null;

class GoIMachine {
	
	constructor() {
		this.graph = new Graph();
		graph = this.graph; // cheating!
		this.token = new MachineToken();
		this.gc = new GC(this.graph);
		this.count = 0;
	}

	compile(source) {
		const lexer = new Lexer(source + '\0');
		const parser = new Parser(lexer);
		const ast = parser.parse();
		// init
		this.graph.clear();
		this.token.reset();
		this.count = 0;
		// create graph
		var start = new Start().addToGroup(this.graph.child);
		var term = this.toGraph(ast, this.graph.child);
		new Link(start.key, term.prin.key, "n", "s").addToGroup(this.graph.child);
		this.token.to = start.key;
	}

	// translation
	toGraph(ast, group) {
		var graph = this.graph;

		if (ast instanceof Identifier) {
			var der = new Der(ast.name).addToGroup(group);
			return new Term(der, [der], []);
		} 

		else if (ast instanceof Abstraction) {
			var param = ast.param;
			var abs = new Abs().addToGroup(group);

			var promoWrapper = BoxWrapper.create().addToGroup(group);
			var promoBox = promoWrapper.box;
			var promo = promoWrapper.prin;
			var box = this.toGraph(ast.body, promoBox);
			promoWrapper.set(promo, promoBox, promoWrapper.createPaxsOnTopOf(box.auxs), promoWrapper.createPaxsPOnTopOf(box.pAuxs));

			var der = new Der().addToGroup(group);
			new Link(promo.key, box.prin.key, "n", "s").addToGroup(promoWrapper);
			new Link(der.key, promo.key, "n", "s").addToGroup(group);
			new Link(abs.key, der.key, "e", "s").addToGroup(group);

			var auxs = Array.from(promoWrapper.auxs);
			var paramUsed = false;
			var auxNode;
			for (let aux of promoWrapper.auxs) {
				if (aux.name == param) {
					paramUsed = true;
					auxNode = aux;
					break;
				}
			}
			if (paramUsed) {
				auxs.splice(auxs.indexOf(auxNode), 1);
			} else {
				auxNode = new Weak(param).addToGroup(group);
			}
			new Link(auxNode.key, abs.key, "nw", "w", true).addToGroup(group);

			return new Term(abs, auxs, box.pAuxs);
		} 

		else if (ast instanceof Application) {
			var app = new App().addToGroup(group);
			//lhs
			var left = this.toGraph(ast.lhs, group);
			// rhs
			var wrapper = BoxWrapper.create().addToGroup(group);
			var right = this.toGraph(ast.rhs, wrapper.box);		
			new Link(wrapper.prin.key, right.prin.key, "n", "s").addToGroup(wrapper);
			wrapper.auxs = wrapper.createPaxsOnTopOf(right.auxs);
			wrapper.pAuxs = wrapper.createPaxsPOnTopOf(right.pAuxs);
			
			new Link(app.key, left.prin.key, "w", "s").addToGroup(group);
			new Link(app.key, wrapper.prin.key, "e", "s").addToGroup(group);

			return new Term(app, Term.joinAuxs(left.auxs, wrapper.auxs, group), left.pAuxs.concat(right.pAuxs));
		} 

		else if (ast instanceof Constant) {
			var constant = new Const(ast.value).addToGroup(group);
			return new Term(constant, [], []);
		}

		else if (ast instanceof Folding) {
			var foldOp = new Fold().addToGroup(group);

			var leftWrapper = BoxWrapper.create().addToGroup(group);
			var leftBox = leftWrapper.box;
			var leftPromo = leftWrapper.prin;
			var left = this.toGraph(ast.t1, leftBox);
			new Link(leftPromo.key, left.prin.key, "n", "s").addToGroup(leftWrapper);
			leftWrapper.set(leftPromo, leftBox, leftWrapper.createPaxsOnTopOf(left.auxs), leftWrapper.createPaxsPOnTopOf(left.pAuxs));


			var rightWrapper = BoxWrapper.create().addToGroup(group);
			var rightBox = rightWrapper.box;
			var rightPromo = rightWrapper.prin;
			var right = this.toGraph(ast.t2, rightBox);
			new Link(rightPromo.key, right.prin.key, "n", "s").addToGroup(rightWrapper);
			rightWrapper.set(rightPromo, rightBox, rightWrapper.createPaxsOnTopOf(right.auxs), rightWrapper.createPaxsPOnTopOf(right.pAuxs));

			new Link(foldOp.key, leftPromo.key, "w", "s").addToGroup(group);
			new Link(foldOp.key, rightPromo.key, "e", "s").addToGroup(group);

			return new Term(foldOp, Term.joinAuxs(leftWrapper.auxs, rightWrapper.auxs, group), left.pAuxs.concat(right.pAuxs));
		}

		else if (ast instanceof BinaryOp) {
			var binop;
			if (ast instanceof VectorBinaryOp)
				binop = new VecBinOp(ast.name).addToGraph(graph).addToGroup(group);
			else
				binop = new BinOp(ast.name).addToGraph(graph).addToGroup(group);

			binop.subType = ast.type;

			var leftWrapper = BoxWrapper.create().addToGroup(group);
			var leftBox = leftWrapper.box;
			var leftPromo = leftWrapper.prin;
			var left = this.toGraph(ast.v1, leftBox);
			new Link(leftPromo.key, left.prin.key, "n", "s").addToGroup(leftWrapper);
			leftWrapper.set(leftPromo, leftBox, leftWrapper.createPaxsOnTopOf(left.auxs), leftWrapper.createPaxsPOnTopOf(left.pAuxs));
			var leftDer = new Der(leftPromo.name).addToGroup(group);
			new Link(leftDer.key, leftPromo.key, "n", "s").addToGroup(leftWrapper.group);
			
			var rightWrapper = BoxWrapper.create().addToGroup(group);
			var rightBox = rightWrapper.box;
			var rightPromo = rightWrapper.prin;
			var right = this.toGraph(ast.v2, rightBox);
			new Link(rightPromo.key, right.prin.key, "n", "s").addToGroup(rightWrapper);
			rightWrapper.set(rightPromo, rightBox, rightWrapper.createPaxsOnTopOf(right.auxs), rightWrapper.createPaxsPOnTopOf(right.pAuxs));
			var rightDer = new Der(rightPromo.name).addToGroup(group);
			new Link(rightDer.key, rightPromo.key, "n", "s").addToGroup(leftWrapper.group);

			new Link(binop.key, leftDer.key, "w", "s").addToGroup(group);
			new Link(binop.key, rightDer.key, "e", "s").addToGroup(group);

			return new Term(binop, Term.joinAuxs(leftWrapper.auxs, rightWrapper.auxs, group), left.pAuxs.concat(right.pAuxs));
		}

		else if (ast instanceof UnaryOp) {
			var unop = new UnOp(ast.name).addToGroup(group);
			unop.subType = ast.type;

			var leftWrapper = BoxWrapper.create().addToGroup(group);
			var leftBox = leftWrapper.box;
			var leftPromo = leftWrapper.prin;
			var left = this.toGraph(ast.v1, leftBox);
			new Link(leftPromo.key, left.prin.key, "n", "s").addToGroup(leftWrapper);
			leftWrapper.set(leftPromo, leftBox, leftWrapper.createPaxsOnTopOf(left.auxs), leftWrapper.createPaxsPOnTopOf(left.pAuxs));
			var leftDer = new Der(leftPromo.name).addToGroup(group);
			new Link(leftDer.key, leftPromo.key, "n", "s").addToGroup(leftWrapper.group);

			new Link(unop.key, leftDer.key, "n", "s").addToGroup(group);

			return new Term(unop, leftWrapper.auxs, left.pAuxs);
		}
/*
		else if (ast instanceof IfThenElse) {
			var ifnode = new If().addToGroup(group);
			var cond = this.toGraph(ast.cond, group);
			var t1 = this.toGraph(ast.t1, group);
			var t2 = this.toGraph(ast.t2, group);

			new Link(ifnode.key, cond.prin.key, "w", "s").addToGroup(group);
			new Link(ifnode.key, t1.prin.key, "n", "s").addToGroup(group);
			new Link(ifnode.key, t2.prin.key, "e", "s").addToGroup(group);

			return new Term(ifnode, Term.joinAuxs(Term.joinAuxs(t1.auxs, t2.auxs, group), cond.auxs, group));
		}

		else if (ast instanceof Recursion) {
			var p1 = ast.param;
			// recur term
			var wrapper = BoxWrapper.create().addToGroup(group);
			wrapper.prin.delete();
			var recur = new Recur().addToGroup(wrapper);
			wrapper.prin = recur;
			var box = this.toGraph(ast.body, wrapper.box);
			wrapper.auxs = Array.from(box.auxs);

			new Link(recur.key, box.prin.key, "e", "s").addToGroup(wrapper);

			var p1Used = false;
			var auxNode1;
			for (var i=0; i<wrapper.auxs.length; i++) {
				var aux = wrapper.auxs[i];
				if (aux.name == p1) {
					p1Used = true;
					auxNode1 = aux;
					break;
				}
			}
			if (p1Used) {
				wrapper.auxs.splice(wrapper.auxs.indexOf(auxNode1), 1);
			} else {
				auxNode1 = new Weak(p1).addToGroup(wrapper.box);
			}
			new Link(auxNode1.key, recur.key, "nw", "w", true).addToGroup(wrapper);

			return new Term(wrapper.prin, wrapper.auxs);
		}
*/

		else if (ast instanceof Parameter) {
			var box = this.toGraph(ast.term, group);

			var param = new Param(box.prin.name).addToGroup(group);
			new Link(param.key, box.prin.key, "n", "s").addToGroup(group);

			var der = new Der(param.name).addToGroup(group);
			der.text = "ᗡ";
			new Link(der.key, param.key, "n", "s").addToGroup(group);

			return new Term(der, [], [param]);
		} 
		else if (ast instanceof Abduction) {
			var abs = new Abs().addToGroup(group);
			var abduct = new Abduct().addToGroup(group);

			var promoWrapper = BoxWrapper.create().addToGroup(group);
			var promoBox = promoWrapper.box;
			var promo = promoWrapper.prin;
			var box = this.toGraph(ast.body, promoBox);
			promoWrapper.set(promo, promoBox, promoWrapper.createPaxsOnTopOf(box.auxs), promoWrapper.createPaxsPOnTopOf(box.pAuxs));
			var der = new Der().addToGroup(group);
			new Link(promo.key, box.prin.key, "n", "s").addToGroup(promoWrapper);
			new Link(der.key, promo.key, "n", "s").addToGroup(group);
			new Link(abs.key, der.key, "e", "s").addToGroup(group);

			var p1 = ast.p1;
			var p2 = ast.p2;

			new Link(abduct.key, abs.key, "nw", "w", true).addToGroup(group);

			var auxs = Array.from(promoWrapper.auxs);
			var p1Used = false;
			var p2Used = false;
			var auxNode1;
			var auxNode2;
			for (var i=0; i<auxs.length; i++) {
				var aux = auxs[i];
				if (aux.name == p1) {
					p1Used = true;
					auxNode1 = aux;
				}
				if (aux.name == p2) {
					p2Used = true;
					auxNode2 = aux;
				}
				if (p1Used && p2Used)
					break;
			}
			if (p1Used) {
				auxs.splice(auxs.indexOf(auxNode1), 1);
			} else {
				auxNode1 = new Weak(p1).addToGroup(group);
			}
			if (p2Used) {
				auxs.splice(auxs.indexOf(auxNode2), 1);
			} else {
				auxNode2 = new Weak(p2).addToGroup(group);
			}

			new Link(auxNode1.key, abduct.key, "n", "w").addToGroup(group);
			new Link(auxNode2.key, abduct.key, "n", "e").addToGroup(group);
			return new Term(abs, auxs, box.pAuxs);
		}

	}

	// machine step
	pass(flag, dataStack, boxStack) {	
		if (!finished) {
			this.count++;
			if (this.count == 200) {
				this.count = 0;
				this.gc.collect();
			}

			var node;
			if (!this.token.transited) {

				if (this.token.link != null) {
					var target = this.token.forward ? this.token.link.to : this.token.link.from;
					node = this.graph.findNodeByKey(target);
				}
				else
					node = this.graph.findNodeByKey("nd1");


				this.token.rewrite = false;
				var nextLink = node.transition(this.token, this.token.link);
				if (nextLink != null) {
					this.token.setLink(nextLink);
					this.printHistory(flag, dataStack, boxStack); 
					this.token.transited = true;
				}
				else {
					this.gc.collect();
					this.token.setLink(null);
					play = false;
					playing = false;
					finished = true;
				}
			}
			else {
				var target = this.token.forward ? this.token.link.from : this.token.link.to;
				node = this.graph.findNodeByKey(target);
				var nextLink = node.rewrite(this.token, this.token.link);
				if (!this.token.rewrite) {
					var nextNode = this.graph.findNodeByKey(this.token.forward ? this.token.link.to : this.token.link.from);
					nextLink = nextNode.rewrite(this.token, nextLink);
					if (!this.token.rewrite) {
						this.token.transited = false;
						this.pass(flag, dataStack, boxStack);
					}
					else {
						this.token.setLink(nextLink);
						this.printHistory(flag, dataStack, boxStack);
					}
				}
				else {
					this.token.setLink(nextLink);
					this.printHistory(flag, dataStack, boxStack);
				}
			}
		}
	}

	printHistory(flag, dataStack, boxStack) {
		flag.val(this.token.rewriteFlag + '\n' + flag.val());
		var dataStr = this.token.dataStack.length == 0 ? '□' : Array.from(this.token.dataStack).reverse().toString() + ',□';
		dataStack.val(dataStr + '\n' + dataStack.val());
		var boxStr = this.token.boxStack.length == 0 ? '□' : Array.from(this.token.boxStack).reverse().toString() + ',□';
		boxStack.val(boxStr + '\n' + boxStack.val());
		//console.log(this.graph.allNodes);
	}

}

define('goi-machine',
	function(require) {
		require('gc');
		require('node');
		require('group');
		require('graph');
		require('link');
		require('term');
		require('token');
		require('op');
		require('parser/ast');
		require('parser/token');
		require('parser/lexer');
		require('parser/parser');
		require('nodes/expo');
		require('nodes/abs');
		require('nodes/app');
		require('nodes/binop');
		require('nodes/const');
		require('nodes/contract');
		require('nodes/der');
		require('nodes/if');
		require('nodes/pax');
		require('nodes/promo');
		require('nodes/recur');
		require('nodes/start');
		require('nodes/unop');
		require('nodes/weak');
		require('nodes/abduct');
		require('nodes/fold');
		require('nodes/parameter');
		require('nodes/pax-param');
		require('nodes/vec-binop');
		require('nodes/vec-match');
		require('nodes/vec');
		return new GoIMachine();	
	}
);