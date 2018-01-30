var simple_abd_prog = 
		   		'let f@p = {1} + 2 in'
	+ '\n' + 	'f p';

var higher_abd_prog =
				'let y = {2} + 1 in'
	+ '\n' + 	'let m = λx.{3} + y + x in'
	+ '\n' +	'let f@p = m in'
	+ '\n' +	'f p 7';

var fig10_1 = 
				'let f@p = (λx.x+x) {1} in'
	+ '\n' +	'p ⊡ p';

var fig10_2 = 
				'let f@p = {1} + {1} in'
	+ '\n' +	'p ⊡ p';

var meta_learning = 
				'let g@q ='
	+ '\n' +	'  (let f@p = {1} in f ({2} ⊠ p))'
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
+ '\n' + 'let f@ps = m in'
+ '\n' + "let m' = f (learn f ps loss 0.001) in"
+ '\n' + "m' 7";