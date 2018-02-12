define(function() {

	var CompData = {
		PROMPT: '*',
		LAMBDA: 'λ',
		R: '@',
	}

	var RewriteFlag = {
		EMPTY: '□',
		F_LAMBDA: '<λ>',
		F_OP: '<$>',
		F_IF: '<if>',
		F_RECUR: '<μ>',
		
		F_PROMO_O: '<?>',
		F_PROMO_C: '<!>',
		F_FOLD: '<F>',
	}

	class MachineToken {

		constructor() {
			this.reset();
			this.CompData = CompData;
			this.RewriteFlag = RewriteFlag;
		}

		setLink(link) {
			if (this.link != null)
				this.link.clearFocus();
			this.link = link;
			if (this.link != null) {
				this.link.focus("red");
			}
		}

		reset() {
			this.forward = true;
			this.rewrite = false;
			this.transited = false;
			
			this.link = null;
			
			this.rewriteFlag = RewriteFlag.EMPTY;
			this.dataStack = [CompData.PROMPT];
			this.boxStack = [];
		}
	}

	return MachineToken;
});



