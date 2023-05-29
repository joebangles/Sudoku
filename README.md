# Sudoku
Solves Sudoku puzzles with visual HTML representation. Can solve almost all puzzles that don't require guessing strategies.

Accessible at quinnquinnquinn.com/sudoku

# Puzzle codes for easier access:

Easy:  
500467309903810427174203000231976854857124090496308172000089260782641005010000708
051200090038079040290500006123600700870301054009008361400002015010860430060007920
403000000680000500750003090500080130000090702017005006060138940009052060030907825

Medium:  
000407050030600000070000003000000560000006020009705040050008100803100405000900000
020709000000000002003000480050000000000105000214000900000080190081050760000003050 (First medium solved)

Hard:  
003010005800000200001600008030006080200040300070020050000000009040361000008000060 (First hard solved)

Most difficulty ratings thus far are just because they were ripped from nytimes.com.

# Strategy Guide:  

All puzzles are currently solved with the following strategies:  

1. Single Candidates
2. Single Options
3. Cycle Detection

## Single Candidates:
If a square only has one valid option, it's deemed a single candidate square. We can fill this in with that option.

![image](https://github.com/joebangles/Sudoku/assets/49799821/0241877f-ee7d-488e-ad5d-332ed7a5f57a)

## Single Options:
If there's only one possibilty in a box/row/column for a number, we can fill that square.

![image](https://github.com/joebangles/Sudoku/assets/49799821/de7b9fc6-bc9b-4036-b4d3-56132e3bd6e0)

## Cycle Detection:
Instead of being used to assign a value to a square, cycle detection is used to eliminate as many possibilities as possible for other squares. For any N larger than 1, if N squares in a box/row/column have only a total of N unique possibilities, this is a cycle/chain. This means that no other square in this box/row/column can have this value. In the below example, the 7 and 9 form a cycle within this box and therefore no other squares can have these values. This is a very simply example, while the solver looks for chains up to 8 squares long.  
![image](https://github.com/joebangles/Sudoku/assets/49799821/6c17dbd6-ce90-4347-902f-9c1fe4d18dbb)
![image](https://github.com/joebangles/Sudoku/assets/49799821/643297d2-9e31-40dd-aee8-979934a859f8)
