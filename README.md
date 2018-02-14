# Idealised Tensor Flow Visualiser
A simulation tool of a GoI-style abstract machine implementing the *Idealised Tensor Flow* programming language. 

## Usage
1. Select an example, or type in your own program in the white textbox on the left.
2. Click the >> button to translate a program into the corresponding graph. 
3. Click the ► button to run the execution. 

An execution can be paused by the ❚❚ button, resumed by the ► button, and run step-by-step by the ►| button. The ↻ button refreshes the drawing. Un-checking the Draw button stops drawing graphs. 

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

Special charaters can be entered in the white textbox as follows: 
- `λ` = `\lambda`
- `⊞` = `\sq+`
- `⊠` = `\sq*`
- `⊡` = `\sq.`

## What you can see
- A graph, with the token indicated by the red edge.
  - Its Graphviz source is shown in the gray textbox on the left.
- The token data below the graph, whose top lines are always the latest:
  - On the left is the rewrite flag. The graph is rewritten whenever the flag is raised, i.e. set to <λ> or <!>.
  - In the middle is the computation stack, which is used for computing primitive data.  
  - On the right is the box stack, used to manage duplication of sub-graphs wrapped in a dashed box.

## For more information
### Developers
[Steven Cheung](http://www.cs.bham.ac.uk/~wtc488/)

### References
[Koko Muroya](http://www.cs.bham.ac.uk/~kxm538/), [Steven Cheung](http://www.cs.bham.ac.uk/~wtc488/), [Dan R. Ghica](http://www.cs.bham.ac.uk/~drg/). **Abductive functional programming, a semantic approach**. *Prepint*. [\[arivx\]](https://arxiv.org/abs/1710.03984)

### Libraries
This tool uses [graph-viz-d3-js](https://github.com/mstefaniuk/graph-viz-d3-js) for generating diagrams, and [lc-js](https://github.com/tadeuzagallo/lc-js) for parsing programs.
