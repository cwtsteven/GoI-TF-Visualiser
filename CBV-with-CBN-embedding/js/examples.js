var simple_abd_prog = 
		   		'let (f,p) = abs {1} + 2 in'
	+ '\n' + 	'f p';

var higher_abd_prog =
				'let y = {2} + 1 in'
	+ '\n' + 	'let m = λx.{3} + y + x in'
	+ '\n' +	'let (f,p) = abs m in'
	+ '\n' +	'f p 7';

var fig10_1 = 
				'let (f,p) = abs (λx.x+x) {1} in'
	+ '\n' +	'p ⊡ p';

var fig10_2 = 
				'let (f,p) = abs {1} + {1} in'
	+ '\n' +	'p ⊡ p';

var meta_learning = 
				'let (g,q) ='
	+ '\n' +	'  (let (f,p) = abs {1} in f ({2} ⊠ p))'
	+ '\n' +	'in'
	+ '\n' +	'g q';

var fact_prog = 	   
		 'let fact = rec(f,x).'
+ '\n' + '  if (x <= 1)'
+ '\n' + '    then 1'
+ '\n' + '    else (x * (f (x - 1)))'
+ '\n' + 'in'
+ '\n' + '  fact 4';

var church_numerals_prog = 
		 'let inc = λx. x+1 in'
+ '\n' + 'let plus = λm.λn.λf.λx.m f (n f x) in'
+ '\n' + 'let succ = λn.λf.λx.f(n f x) in'
+ '\n' + 'let zero = λf.λx.x in'
+ '\n' + 'plus (succ zero) (succ zero) inc 0'

var confidence_interval =
		 'let f = λa.λb.λx.a * x + b in'
+ '\n' + 'let pair = λx.λy.λz.z x y in'
+ '\n' + 'let fst = λp.p (λx.λy.x) in'
+ '\n' + 'let a = {1} in' 
+ '\n' + 'let ci = pair (f a {1}) (f a {2}) in'
+ '\n' + 'let (pcim, p) = abs ci in' 
+ '\n' + 'let cim = pcim p in' 
+ '\n' + 'fst cim 7'

var weighted_regression =
		 'let f = λa.λb.λx.a * x + b in'
+ '\n' + 'let pair = λx.λy.λz.z x y in'
+ '\n' + 'let fst = λp.p (λx.λy.x) in'
+ '\n' + 'let wr = pair (f {1} {0}) (f {1} {0}) in'
+ '\n' + 'let (pwrm, p) = abs wr in' 
+ '\n' + 'let wrm = pwrm p in' 
+ '\n' + 'fst wrm 7'

// y = 2x + 10
var gradient_descent_prog = 	  
		 'let sq = λx. x * x in'
+ '\n'
+ '\n' + 'let loss = λf.λps.'
+ '\n' + '  ((sq (10 - (f ps 0))) '
+ '\n' + '  + (sq (12 - (f ps 1))) '
+ '\n' + '  + (sq (14 - (f ps 2)))) '
+ '\n' + '  / 3'
+ '\n' + 'in'
+ '\n' 
+ '\n' + 'let grad_desc = λf.λps.λloss.λrate.'
+ '\n' + '  let d = 0.001 in'
+ '\n' + '  let g = λe.'
+ '\n' + '    let new = loss f (ps ⊞ (d ⊠ e)) in'
+ '\n' + '    let old = loss f ps in'
+ '\n' + '    ((0 - (new - old) / d) * rate) ⊠ e'
+ '\n' + '  in'
+ '\n' + '  fold (λe.λps.(g e) ⊞ ps, ps)'
+ '\n' + 'in'
+ '\n' 
+ '\n' + 'let learn = λf.λps.λloss.λrate.'
+ '\n' + "   let ps' = grad_desc f ps loss rate in"
+ '\n' + "   grad_desc f ps' loss rate"
+ '\n' + 'in'
+ '\n' 
+ '\n' + 'let m = λx.{1} * x + {0} in'
+ '\n' + 'let (f,ps) = abs m in'
+ '\n' + "let m' = f (learn f ps loss 0.001) in"
+ '\n' + "m' 7";