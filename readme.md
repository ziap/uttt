# Ultimate Tic Tac Toe Remastered

A work in progress replacement for my old UTTT game.

![](logo.png)

## What is Ultimate Tic Tac Toe

Basically, it's a less boring and more sophisticated version of tic-tac-toe.

The rules are:

> 1. Each turn, you mark one of the small squares.
> 2. When you get three in a row on a small board, you’ve won that board.
> 3. To win the game, you need to win three small boards in a row.
>
> **You don’t get to pick which of the nine boards to play on.** That’s
> determined by your opponent’s previous move. Whichever square he picks,
> that’s the board you must play in next. (And whichever square you pick will
> determine which board he plays on next.)
>
> **What if my opponent sends me to a board that’s already been won?** In that
> case, congratulations – you get to go anywhere you like, on any of the other
> boards.
>
> **What if one of the small boards results in a tie?** That board counts for
> neither X nor O.

[Source](https://mathwithbaddrawings.com/2013/06/16/ultimate-tic-tac-toe/)

## Improvements

- [x] Uses Modern ES6 syntax and module.
- [x] UI and animations are done entirely with CSS.
- [x] Ultra-Responsive UI layout.
- [ ] Enhanced WebAssembly powered AI.

## Usage

To run the application

```bash
# Serve the app locally with your HTTP server of choice
python3 -m http.server 8080

# Launch the app in your browser of choice
firefox http://localhost:8080
```

This project uses TypeScript for type-checking and static analysis but not for
advanced type system features. To type-check the project, install TypeScript and
run

```bash
npx tsc --project jsconfig.json
```

# License

This app is licensed under the [MIT license](LICENSE).
