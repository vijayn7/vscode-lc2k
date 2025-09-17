# LC2K Assembly Language Support for VS Code

A comprehensive Visual Studio Code extension providing rich language support for LC-2K (Little Computer 2000) assembly language, commonly used in EECS 370 courses.

## 🚀 Features

### Syntax Highlighting
- **Comprehensive highlighting** for all LC-2K instructions, directives, and data types
- **Smart label recognition** - different colors for label definitions vs references
- **Number format support** - decimal, hexadecimal (`0x`), and binary (`0b`) literals
- **Comment support** - line comments (`#`) and block comments (`/* */`)
- **Register highlighting** - visual distinction for registers 0-7

### Code Intelligence
- **Real-time diagnostics** - syntax validation while you type
- **Hover tooltips** - instruction documentation with format and examples
- **Error detection**:
  - Unknown opcodes and directives
  - Invalid register numbers (must be 0-7)
  - Duplicate or malformed labels
  - Missing instruction operands
  - Incorrect `.fill` usage

### Code Completion & Snippets
- **Smart snippets** for all LC-2K instructions with parameter placeholders
- **Template library**:
  - Program headers with documentation
  - Loop structures
  - Function templates with call/return patterns
  - Multiplication algorithm template
  - Data sections
  - Conditional branching patterns

### Formatting & Organization
- **Auto-align columns** - perfectly format your assembly code
- **Configurable tab stops** - customize column alignment
- **Smart indentation** - context-aware formatting
- **Code folding** - organize code with `#region`/`#endregion` markers

### Development Tools
- **Machine code preview** - see assembled output alongside source
- **Syntax validation** - manual checking with problem panel integration
- **Instruction reference** - interactive documentation viewer
- **Quick templates** - insert common code patterns instantly

## 📋 Supported Instructions

| Instruction | Type | Format | Description |
|-------------|------|--------|-------------|
| `ADD` | R-type | `add regA regB destReg` | Add regA + regB → destReg |
| `NOR` | R-type | `nor regA regB destReg` | ~(regA \| regB) → destReg |
| `LW` | I-type | `lw regA regB offset` | Memory[regA + offset] → regB |
| `SW` | I-type | `sw regA regB offset` | regB → Memory[regA + offset] |
| `BEQ` | I-type | `beq regA regB offset` | Branch if regA == regB |
| `JALR` | J-type | `jalr regA regB` | PC+1 → regB, regA → PC |
| `HALT` | O-type | `halt` | Stop execution |
| `NOOP` | O-type | `noop` | No operation |

### Directives
- `.fill` - Insert data values or label addresses

## ⚙️ Commands

- **LC2K: Align Columns** (`Ctrl+Shift+A` / `Cmd+Shift+A`) - Format code alignment
- **LC2K: Convert to Machine Code View** - Preview assembled output
- **LC2K: Insert Code Template** - Quick access to code templates
- **LC2K: Validate Syntax** - Manual syntax check with error highlighting
- **LC2K: Show Instruction Reference** (`F1`) - Open instruction documentation

## 🔧 Configuration Options

```json
{
  "lc2k.tabStops": [8, 16, 24, 40],
  "lc2k.commentToken": "#",
  "lc2k.enableRealTimeValidation": true,
  "lc2k.showInstructionHints": true,
  "lc2k.highlightRegisterUsage": false,
  "lc2k.maxLabelLength": 6,
  "lc2k.strictMode": false
}
```

## 📝 Example Code

```assembly
# LC-2K Assembly Program
# Author: Student Name
# Description: Count down from 5 to 0

        lw      0       1       five    # load 5 into R1
        lw      1       2       3       # load -1 into R2
start   add     1       2       1       # decrement R1
        beq     0       1       2       # if R1 == 0, jump ahead 2
        beq     0       0       start   # else jump back to start
        noop
done    halt                            # end program
five    .fill   5                       # constant: 5
neg1    .fill   -1                      # constant: -1
```

## 🚀 Quick Start

1. Install the extension
2. Open or create a file with `.lc2k`, `.as`, or `.s` extension
3. Start typing - enjoy syntax highlighting and auto-completion!
4. Use `Ctrl+Shift+A` (Windows/Linux) or `Cmd+Shift+A` (Mac) to align columns
5. Press `F1` to open the instruction reference guide

## 📦 File Extensions

This extension activates for files with these extensions:
- `.lc2k` - LC2K assembly files
- `.as` - Assembly source files  
- `.s` - Assembly source files

## 🛠️ Development & Contributing

This extension is built with TypeScript and the VS Code Extension API. Contributions are welcome!

### Building from Source
```bash
git clone https://github.com/vijayn7/vscode-lc2k.git
cd vscode-lc2k
npm install
npm run compile
```

### Testing
Press `F5` in VS Code to launch the Extension Development Host for testing.

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Designed for EECS 370 students at the University of Michigan
- Based on the LC-2K (Little Computer 2000) instruction set architecture
- Inspired by the need for better assembly language tooling in computer architecture courses

---

**Happy coding with LC2K Assembly! 🎯**