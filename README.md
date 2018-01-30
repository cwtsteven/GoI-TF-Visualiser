## Syntax
```
<var> ::= {variables}
<num> ::= {num}
<expr> ::= <var>
         | λ <var>. <expr>
         | <expr> <expr>
         | <num>
         | <expr> + <expr> | <expr> - <expr> | <expr> * <expr> | <expr> / <expr>
         | <expr> ⊞ <expr> | <expr> ⊠ <expr> | <expr> ⊡ <expr>  
         | {<num>}
         | abd(<var>,<var>). <expr>
         | fold(<expr>,<expr>)
         | let <var> = <expr> in <expr>
         | let <var>@<var> = <expr> in <expr>
```
