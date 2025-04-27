import * as vscode from 'vscode';
import { getRelativePath } from '../utils/fileUtils';
import { copyToClipboard } from '../utils/clipboard';
import { SNIPPET_SNACKER_PREFIX } from '../constants';

export async function copySelectionWithProblems(uri?: vscode.Uri, range?: vscode.Range): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    const currentUri = uri ?? editor?.document.uri;
    const currentRange = range ?? editor?.selection;

    if (!currentUri || !currentRange || currentRange.isEmpty) {
        vscode.window.showWarningMessage(`${SNIPPET_SNACKER_PREFIX} No non-empty selection found.`);
        return;
    }

    try {
        const document = await vscode.workspace.openTextDocument(currentUri);
        const selectedText = document.getText(currentRange);
        const relativePath = getRelativePath(currentUri);
        const startLine = currentRange.start.line + 1;
        const endLine = currentRange.end.line + 1;
        const lineInfo = startLine === endLine ? `(Line: ${startLine})` : `(Lines: ${startLine}-${endLine})`;

        // Get diagnostics (problems) for the current file
        const diagnostics = vscode.languages.getDiagnostics(currentUri);

        // Filter diagnostics that intersect with the selection
        const relevantDiagnostics = diagnostics.filter(diagnostic =>
            currentRange.intersection(diagnostic.range) // Check for overlap
            // Or potentially: currentRange.contains(diagnostic.range.start) || currentRange.contains(diagnostic.range.end)
        );

        let problemsString = '';
        if (relevantDiagnostics.length > 0) {
            problemsString = '\n\nRelevant Problems:\n';
            relevantDiagnostics.forEach(diag => {
                const severity = vscode.DiagnosticSeverity[diag.severity].toUpperCase();
                const diagLine = diag.range.start.line + 1;
                problemsString += `- [${severity} at Line ${diagLine}]: ${diag.message} (${diag.source || 'source unknown'})\n`;
            });
        } else {
            problemsString = '\n\n(No problems found within the selected lines)';
        }

        const contentToCopy = `// File: ${relativePath} ${lineInfo}\n${selectedText}${problemsString}`;

        await copyToClipboard(contentToCopy, 'Copied selection with problems!');

    } catch (error) {
        console.error("Snippet Snacker Error (copySelectionWithProblems):", error);
        vscode.window.showErrorMessage(`${SNIPPET_SNACKER_PREFIX} Failed to copy selection with problems. ${error instanceof Error ? error.message : String(error)}`);
    }
}