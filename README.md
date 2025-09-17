# LC2K Assembly for VS Code

Language support for LC-2K used in EECS 370.

Features:
- Syntax highlighting for labels, opcodes, registers, numbers, directives
- `#` line comments
- Snippets for instructions and `.fill`
- Diagnostics: unknown opcode, bad registers, invalid labels, duplicate labels, missing operands, `.fill` ordering
- Command: LC2K - Align Columns

## Build and run
1. `npm install`
2. Press `F5` in VS Code to launch the Extension Development Host
3. Create a file `spec.lc2k` and type

## Pack
- `npm run package` to create a `.vsix`

## Settings
- `lc2k.tabStops`: default `[8,16,24,40]`
- `lc2k.commentToken`: default `#`