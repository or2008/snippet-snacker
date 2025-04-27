import * as vscode from 'vscode';
import { getRelativePath } from '../utils/fileUtils';
import { copyToClipboard } from '../utils/clipboard';
import { SNIPPET_SNACKER_PREFIX } from '../constants';

export async function copySelectionWithPath(uri?: vscode.Uri, range?: vscode.Range): Promise<void> {
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

        const contentToCopy = `// File: ${relativePath} ${lineInfo}\n${selectedText}`;

        await copyToClipboard(contentToCopy, 'Copied selection with path!');

    } catch (error) {
        console.error("Snippet Snacker Error (copySelectionWithPath):", error);
        vscode.window.showErrorMessage(`${SNIPPET_SNACKER_PREFIX} Failed to copy selection. ${error instanceof Error ? error.message : String(error)}`);
    }
}