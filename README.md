# Idealised Tensor Flow Visualiser
A simulation tool of a GoI-style abstract machine implementing the Idealised Tensor Flow programming language. 

## Usage
1. Select an example, or enter your own closed lambda-term.
2. Select an evaluation strategy, or click the >> button if you are happy with the current strategy.
3. Click the ► button.

Un-checking the Draw button stops drawing graphs. An execution can be paused by the ❚❚ button, resumed by the ► button, and run step-by-step by the ►| button. The ↻ button refreshes the drawing.

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
         | fold <expr> <expr>
         | let <var> = <expr> in <expr>
         | let (<var>,<var>) = abs <expr> in <expr>
```

## What you can see
- A graph, with the token indicated by the red edge.
  - Its Graphviz source is shown in the left gray box.
- The token data below the graph, whose top lines are always the latest:
  - The left data is rewrite flag. The graph is rewritten whenever the flag is raised, i.e. set to <λ> or <!>.
  - The middle data is computation stack, used to determine the order of evaluating a function and its argument.
  - The right data is box stack, used to manage duplication of sub-graphs wrapped in a dashed box.
