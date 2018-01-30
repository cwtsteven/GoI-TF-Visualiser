class VecBinOp extends Node {

	constructor(text) {
		super(null, text, null);
		this.subType = null;
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
			if (token.dataStack[token.dataStack.length-3] == CompData.PROMPT) {
				var l = token.dataStack.pop();
				var r = token.dataStack.pop();
						token.dataStack.pop();
				var result = this.binOpApply(this.subType, l, r);

				token.dataStack.push(result);
				token.rewriteFlag = RewriteFlag.F_OP;
				return this.findLinksInto(null)[0];
			}
		}
	}

	rewrite(token, nextLink) {
		if (token.rewriteFlag == RewriteFlag.F_OP && nextLink.to == this.key) {
			token.rewriteFlag = RewriteFlag.EMPTY;

			var data = token.dataStack.last();
			var leftNode = this.graph.findNodeByKey(this.findLinksOutOf("w")[0].to); 
			var rightNode = this.graph.findNodeByKey(this.findLinksOutOf("e")[0].to); 

			if (this.subType == BinOpType.VecPlus) {
				if (leftNode instanceof Vec && rightNode instanceof Vec) {
					leftNode.name = data;
					leftNode.text = data;
					nextLink.changeTo(leftNode.key, 's');
					rightNode.delete();
					this.delete();
					token.rewrite = true;
					return nextLink;
				}
			}
			else if (this.subType == BinOpType.VecMult) {
				if (leftNode instanceof Const && rightNode instanceof Vec) {
					rightNode.name = data;
					rightNode.text = data;					
					nextLink.changeTo(rightNode.key, 's');
					leftNode.delete();
					this.delete();
					token.rewrite = true;
					return nextLink;
				}
			}
			else if (this.subType == BinOpType.VecDot) {
				if (leftNode instanceof Vec && rightNode instanceof Vec) {
					var newConst = new Const(data).addToGroup(this.group);
					nextLink.changeTo(newConst.key, 's');
					leftNode.delete();
					rightNode.delete();
					this.delete();
					token.rewrite = true;
					return nextLink;
				}
			}
		}

		else if (token.rewriteFlag == RewriteFlag.EMPTY) {
			token.rewrite = false;
			return nextLink;
		}
	}

	binOpApply(type, v1, v2) {
		switch(type) {
			case BinOpType.VecPlus: 
				if (v1.length != v2.length)
					return null;
				var result = new Vector();
				for (var i=0; i<v1.length; i++) {
					result.push(v1[i] + v2[i]);
				}
				return result;
			case BinOpType.VecMult:
				var result = new Vector();
				for (var i=0; i<v2.length; i++) {
					result.push(v1 * v2[i]);
				}
				return result;
			case BinOpType.VecDot:
				if (v1.length != v2.length)
					return null;
				var result = 0;
				for (var i=0; i<v1.length; i++) {
					result += v1[i] * v2[i];
				}
				return result;
		}
	}

	static createPlus() {
		var op = new VecBinOp('⊞');
		op.subType = BinOpType.VecPlus;
		return op;
	}

	static createMult() {
		var op = new VecBinOp('⊠');
		op.subType = BinOpType.VecMult;
		return op;
	}

	static createDot() {
		var op = new VecBinOp('⊡');
		op.subType = BinOpType.VecDot;
		return op;
	}

	copy() {
		var newNode = new VecBinOp(this.text);
		newNode.subType = this.subType;
		return newNode;
	}
	
}