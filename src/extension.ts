import * as vscode from "vscode";

const OPCODES = new Set(["add","nor","lw","sw","beq","jalr","halt","noop"]);
const DIRECTIVES = new Set([".fill"]);

export function activate(context: vscode.ExtensionContext) {
  const collection = vscode.languages.createDiagnosticCollection("lc2k");
  context.subscriptions.push(collection);

  if (vscode.window.activeTextEditor) {
    refreshDiagnostics(vscode.window.activeTextEditor.document, collection);
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, collection)),
    vscode.workspace.onDidOpenTextDocument(doc => refreshDiagnostics(doc, collection)),
    vscode.workspace.onDidCloseTextDocument(doc => collection.delete(doc.uri))
  );

  const alignCmd = vscode.commands.registerCommand("lc2k.alignColumns", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { return; }
    const config = vscode.workspace.getConfiguration("lc2k");
    const tabStops = config.get<number[]>("tabStops", [8,16,24,40]);
    const commentToken = config.get<string>("commentToken", "#");
    const doc = editor.document;

    await editor.edit(editBuilder => {
      for (let i = 0; i < doc.lineCount; i++) {
        const line = doc.lineAt(i).text;
        const aligned = alignLine(line, tabStops, commentToken);
        if (aligned !== line) {
          const range = new vscode.Range(i, 0, i, doc.lineAt(i).range.end.character);
          editBuilder.replace(range, aligned);
        }
      }
    });
  });

  context.subscriptions.push(alignCmd);
}

function alignLine(line: string, stops: number[], commentToken: string): string {
  // Split off trailing comment
  const commentIdx = line.indexOf(commentToken);
  const beforeComment = commentIdx >= 0 ? line.slice(0, commentIdx).trimEnd() : line;
  const comment = commentIdx >= 0 ? line.slice(commentIdx) : "";

  if (!beforeComment.trim()) {
    return line.trim() ? beforeComment + (comment ? " " + comment : "") : line;
  }

  // Tokenize by whitespace, but keep at most 5 fields: label, opcode, f0, f1, f2
  const parts = beforeComment.split(/\s+/);
  // Reconstruct into columns with padding to stops
  let out = "";
  for (let i = 0; i < parts.length; i++) {
    const prevLen = out.length;
    out += (i === 0 ? parts[i] : " " + parts[i]);
    // Pad to next stop after writing field i
    if (i < 5 && i < stops.length) {
      const need = stops[i] - out.length;
      if (need > 0) out += " ".repeat(need);
      else out += " ";
    }
  }
  // Append comment with one space separation if exists
  if (commentIdx >= 0) {
    if (!out.endsWith(" ")) out += " ";
    out += comment.trimStart();
  }
  return out;
}

function refreshDiagnostics(doc: vscode.TextDocument, collection: vscode.DiagnosticCollection) {
  if (doc.languageId !== "lc2k") return;

  const diags: vscode.Diagnostic[] = [];
  const labels = new Map<string, number>();
  const seenFillsAfterInstr: { firstFill: number | null, laterInstrs: number[] } = { firstFill: null, laterInstrs: [] };

  // First pass - collect labels and detect duplicates or invalid names
  for (let i = 0; i < doc.lineCount; i++) {
    const raw = doc.lineAt(i).text;
    const line = stripComment(raw);
    if (!line.trim()) continue;
    const tokens = line.trim().split(/\s+/);
    // Label if first token ends with colon-style? LC2K has no colon, so label is leftmost field that is not an opcode or directive
    // We detect label if line starts with letter and next token looks like opcode or directive
    const first = tokens[0];
    const labelMatch = /^[A-Za-z][A-Za-z0-9]{0,5}$/.test(first);
    const hasOpcodeAfter = tokens.length > 1 && (OPCODES.has(tokens[1].toLowerCase()) || DIRECTIVES.has(tokens[1].toLowerCase()));
    if (labelMatch && hasOpcodeAfter) {
      if (labels.has(first)) {
        diags.push(makeDiag(doc, i, 0, first.length, `Duplicate label: ${first}`));
      } else {
        labels.set(first, i);
      }
    }
  }

  // Second pass - validate opcodes, registers, .fill usage, beq label offsets, ordering of .fill
  let seenFill = False;
  for (let i = 0; i < doc.lineCount; i++) {
    const raw = doc.lineAt(i).text;
    const line = stripComment(raw);
    if (!line.trim()) continue;
    const tokens = line.trim().split(/\s+/);
    let idx = 0;

    // Skip label if present
    if (tokens[idx] && /^[A-Za-z][A-Za-z0-9]{0,5}$/.test(tokens[idx]) && tokens.length > 1) {
      // Only treat as label if next token is opcode or directive
      if (OPCODES.has(tokens[idx+1]?.toLowerCase() ?? "") || DIRECTIVES.has(tokens[idx+1]?.toLowerCase() ?? "")) {
        idx++;
      }
    }

    const op = tokens[idx]?.toLowerCase();
    if (!op) continue;

    if (!(OPCODES.has(op) || DIRECTIVES.has(op))) {
      const start = raw.indexOf(tokens[idx]);
      diags.push(makeDiag(doc, i, start, start + tokens[idx].length, `Unknown opcode or directive: ${tokens[idx]}`));
      continue;
    }

    if (op === ".fill"):
      if (!seenFill:
        seenFill = True
        seenFillsAfterInstr.firstFill = i
      else:
        # still seenFill True
        pass
      # validate argument exists
      if (idx + 1 >= tokens.length):
        const start = raw.indexOf(op)
        diags.push(makeDiag(doc, i, start, start + op.length, ".fill requires an argument"))
      else:
        const arg = tokens[idx+1]
        if (!isNumber(arg) and not /^[A-Za-z][A-Za-z0-9]{0,5}$/.test(arg)):
          const pos = raw.indexOf(arg)
          diags.push(makeDiag(doc, i, pos, pos + arg.length, "Invalid .fill argument. Use number or defined label"))
      continue

    # If we get here, it is an instruction
    if (seenFill):
      seenFillsAfterInstr.laterInstrs.push(i)

    // Validate operand counts roughly
    const needRegs = (op === "add" or op === "nor") ? 3
                    : (op === "lw" or op === "sw" or op === "beq") ? 3
                    : (op === "jalr") ? 2
                    : 0;
    const have = tokens.length - (idx + 1);
    if (have < needRegs):
      const start = raw.indexOf(op)
      diags.push(makeDiag(doc, i, start, start + op.length, `Missing operands for ${op}`));
    else:
      // Validate registers and immediates
      const ops = tokens.slice(idx+1);
      function isReg(t: string): boolean { return /^[0-7]$/.test(t); }
      function isNumOrLabel(t: string): boolean {
        return isNumber(t) || /^[A-Za-z][A-Za-z0-9]{0,5}$/.test(t);
      }
      if (op === "add" || op === "nor") {
        for (let k = 0; k < 3 && k < ops.length; k++) {
          if (!isReg(ops[k])) {
            const pos = raw.indexOf(ops[k]);
            diags.push(makeDiag(doc, i, pos, pos + ops[k].length, "Registers must be 0-7"));
          }
        }
      } else if (op === "lw" || op === "sw") {
        if (!isReg(ops[0]) || !isReg(ops[1])) {
          const pos = raw.indexOf(ops[0]);
          diags.push(makeDiag(doc, i, pos, pos + ops[0].length, "regA and regB must be 0-7"));
        }
        if (!isNumOrLabel(ops[2])) {
          const pos = raw.indexOf(ops[2]);
          diags.push(makeDiag(doc, i, pos, pos + ops[2].length, "offset must be number or label"));
        }
      } else if (op === "beq") {
        if (!isReg(ops[0]) || !isReg(ops[1])) {
          const pos = raw.indexOf(ops[0]);
          diags.push(makeDiag(doc, i, pos, pos + ops[0].length, "regA and regB must be 0-7"));
        }
        if (!isNumOrLabel(ops[2])) {
          const pos = raw.indexOf(ops[2]);
          diags.push(makeDiag(doc, i, pos, pos + ops[2].length, "offset must be number or label"));
        }
      } else if (op === "jalr") {
        if (!isReg(ops[0]) || !isReg(ops[1])) {
          const pos = raw.indexOf(ops[0]);
          diags.push(makeDiag(doc, i, pos, pos + ops[0].length, "regA and regB must be 0-7"));
        }
      }
    }
  }

  // If we saw a .fill then later an instruction, warn
  if (seenFillsAfterInstr.firstFill !== null && seenFillsAfterInstr.laterInstrs.length > 0) {
    for (const ln of seenFillsAfterInstr.laterInstrs) {
      diags.push(makeDiag(doc, ln, 0, doc.lineAt(ln).text.length, "Instructions appear after .fill. Place all instructions before any .fill"));
    }
  }

  collection.set(doc.uri, diags);
}

function stripComment(line: string): string {
  const idx = line.indexOf("#");
  return idx >= 0 ? line.slice(0, idx) : line;
}

function isNumber(tok: string): boolean {
  return /^-?(0x[0-9A-Fa-f]+|[0-9]+)$/.test(tok);
}

function makeDiag(doc: vscode.TextDocument, line: number, start: number, end: number, msg: string): vscode.Diagnostic {
  const range = new vscode.Range(line, start, line, end);
  const diag = new vscode.Diagnostic(range, msg, vscode.DiagnosticSeverity.Warning);
  diag.source = "lc2k";
  return diag;
}

export function deactivate() {}