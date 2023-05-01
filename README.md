# Noughts And Crosses
Teaching and testing noughts and crosses game (Tic-tac-toe)

User can play against the computer at four levels of computer skill; if requested, computer will explain its moves.

Computer will also play agianst itself (WOPR mode).  In that case, X is the specified skill level and O is always Poor (random play).

Results from random testing of at least 28,000 games, with X always Poor and O as selected, are:

| **O Skill level**   | **X Wins** | **Draw** | **X loses** |
|---------------------|------------|----------|-------------|
| Poor                | 58%        | 13%      | 29%         |
| Medium              | 6%         | 24%      | 70%         |
| Crowley and Siegler | 0%         |  9%      | 91%         |
| Expert              | 0%         | 11%      | 89%         |

Although the Poor line in the table involves both sides playing with the same 'Poor' skill level, because X goes first, the results are not symmetric.
