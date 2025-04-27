import * as vscode from 'vscode';
import { getRelativePath } from '../utils/fileUtils';
import { copyToClipboard } from '../utils/clipboard';
import { SNIPPET_SNACKER_PREFIX } from '../constants';

// Basic regex to find common import/require statements. Handles simple cases.
// Does NOT handle multi-line imports gracefully or complex scenarios.
// Does NOT determine if the import is actually USED by the selection.
const IMPORT_REGEX = /^(import(?:["'\s]*(?:[\w*{}\n\r\t, ]+)from\s*)?)(["'\s]*(?:[@\w/_-]+)["'\s].*);?/gm;
const REQUIRE_REGEX = /^(?:const|let|var)\s+.*?=\s+require\(.*?\);?/gm;


export async function copySelectionWithImports(uri?: vscode.Uri, range?: vscode.Range): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    const currentUri = uri ?? editor?.document.uri;
    const currentRange = range ?? editor?.selection;

    if (!currentUri || !currentRange || currentRange.isEmpty) {
        vscode.window.showWarningMessage(`${SNIPPET_SNACKER_PREFIX} No non-empty selection found.`);
        return;
    }

    try {
        const document = await vscode.workspace.openTextDocument(currentUri);
        const fullText = document.getText();
        const selectedText = document.getText(currentRange);
        const relativePath = getRelativePath(currentUri);
        const startLine = currentRange.start.line + 1;
        const endLine = currentRange.end.line + 1;
        const lineInfo = startLine === endLine ? `(Line: ${startLine})` : `(Lines: ${startLine}-${endLine})`;

        // Find all potential import/require lines using Regex (Simplified Approach)
        const importMatches = Array.from(fullText.matchAll(IMPORT_REGEX));
        const requireMatches = Array.from(fullText.matchAll(REQUIRE_REGEX));

        const allImports = [...importMatches, ...requireMatches]
            .map(match => match[0]) // Get the full match text
            .filter((value, index, self) => self.indexOf(value) === index); // Basic deduplication

        let importsString = '';
        if (allImports.length > 0) {
            // WARNING: This includes ALL imports, not just those relevant to the selection.
            // Determining relevance requires AST parsing, which is significantly more complex.
            importsString = '// Imports (includes all from file):\n';
            importsString += allImports.join('\n') + '\n\n';
        } else {
            importsString = '// (No imports found in file)\n\n';
        }


        const contentToCopy = `// File: ${relativePath} ${lineInfo}\n${importsString}// Selection:\n${selectedText}`;

        await copyToClipboard(contentToCopy, 'Copied selection with imports (all from file)!');

    } catch (error) {
        console.error("Snippet Snacker Error (copySelectionWithImports):", error);
        vscode.window.showErrorMessage(`${SNIPPET_SNACKER_PREFIX} Failed to copy selection with imports. ${error instanceof Error ? error.message : String(error)}`);
    }
}