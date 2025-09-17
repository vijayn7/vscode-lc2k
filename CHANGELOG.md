# Change Log

All notable changes to the "LC2K Assembly" extension will be documented in this file.

## [0.3.0] - 2025-09-17

### Added
- **Enhanced Commands**:
  - `LC2K: Align Columns` - Auto-align assembly code columns
  - `LC2K: Convert to Machine Code View` - Preview machine code output
  - `LC2K: Insert Code Template` - Quick insertion of common patterns
  - `LC2K: Validate Syntax` - Manual syntax validation with problem panel focus
  - `LC2K: Show Instruction Reference` - Interactive reference guide

- **Rich Code Intelligence**:
  - Hover tooltips with instruction documentation and examples
  - Context menus for LC2K files
  - Keyboard shortcuts (`Ctrl+Shift+A` for align, `F1` for reference)

- **Comprehensive Snippets**:
  - All LC2K instructions with parameter placeholders
  - Program templates (header, function, loop, multiplication)
  - Data section templates
  - Conditional branching patterns

- **Advanced Configuration**:
  - `lc2k.enableRealTimeValidation` - Toggle live syntax checking
  - `lc2k.showInstructionHints` - Control hover tooltips
  - `lc2k.highlightRegisterUsage` - Register usage highlighting
  - `lc2k.maxLabelLength` - Configurable label length limits
  - `lc2k.strictMode` - Enhanced compliance checking

- **Improved Syntax Highlighting**:
  - Distinct colors for label definitions vs references
  - Support for binary numbers (`0b101010`)
  - Block comments (`/* */`) in addition to line comments
  - String literal support
  - Enhanced directive recognition

- **Language Features**:
  - Auto-closing pairs for brackets and quotes
  - Code folding with `#region`/`#endregion` markers
  - Smart indentation rules
  - Improved word boundary detection

### Enhanced
- Real-time diagnostics with configurable validation
- Better error messages and positioning
- Improved label validation and duplicate detection
- Enhanced register range checking (0-7)
- More comprehensive instruction format validation

### Fixed
- TypeScript compilation errors
- Improved regex patterns for better token recognition
- Better handling of edge cases in assembly parsing

## [0.2.0] - 2025-09-17

### Added
- Basic syntax highlighting for `.lc2k`, `.as`, `.s` files
- Core instruction set support (add, nor, lw, sw, beq, jalr, halt, noop)
- `.fill` directive support
- Basic snippets for all instructions
- Real-time syntax validation and diagnostics
- Column alignment command
- Label validation and duplicate checking

### Features
- Support for symbolic addresses and labels
- Register validation (must be 0-7)
- Basic number format support (decimal, hexadecimal)
- Comment support with `#`

## [0.1.0] - Initial Release

### Added
- Basic project structure
- Core language definition for LC2K assembly
- File associations for `.lc2k`, `.as`, `.s` extensions