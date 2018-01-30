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
         | A(<var>,<var>). <expr>
         | fold(<expr>,<expr>)
         | let <var> = <expr> in <expr>
         | let (<var>,<var>) = abs <expr> in <expr>
```
