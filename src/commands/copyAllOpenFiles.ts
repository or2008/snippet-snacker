import * as vscode from 'vscode';
import { getRelativePath } from '../utils/fileUtils';
import { copyToClipboard } from '../utils/clipboard';
import { MAX_FILES_WARN_THRESHOLD, SNIPPET_SNACKER_PREFIX } from '../constants';

export async function copyAllOpenFiles(): Promise<void> {
    const openDocuments = vscode.workspace.textDocuments.filter(doc =>
        !doc.isUntitled &&
        (doc.uri.scheme === 'file' || doc.uri.scheme === 'vscode-remote')
    );

    if (openDocuments.length === 0) {
        vscode.window.showInformationMessage(`${SNIPPET_SNACKER_PREFIX} No open files found to copy.`);
        return;
    }

    if (openDocuments.length > MAX_FILES_WARN_THRESHOLD) {
        const choice = await vscode.window.showWarningMessage(
            `${SNIPPET_SNACKER_PREFIX} You have ${openDocuments.length} files open. Copying all might result in a large amount of text. Continue?`,
            { modal: true },
            'Copy Anyway',
            'Cancel'
        );
        if (choice !== 'Copy Anyway') {
            vscode.window.showInformationMessage(`${SNIPPET_SNACKER_PREFIX} Copy operation cancelled.`);
            return;
        }
    }

    let combinedContent = '';
    const separator = '\n\n---\n\n';

    try {
        for (const document of openDocuments) {
            const relativePath = getRelativePath(document.uri);
            const content = document.getText();
            if (content.trim()) { // Only add non-empty files
                combinedContent += `// File: ${relativePath}\n${content}${separator}`;
            }
        }

        if (combinedContent.endsWith(separator)) {
            combinedContent = combinedContent.slice(0, -separator.length);
        }

        if (!combinedContent) {
            vscode.window.showWarningMessage(`${SNIPPET_SNACKER_PREFIX} No content found in open files.`);
            return;
        }

        await copyToClipboard(combinedContent, `Copied content of ${openDocuments.length} open file(s)!`);

    } catch (error) {
        console.error("Snippet Snacker Error (copyAllOpenFiles):", error);
        vscode.window.showErrorMessage(`${SNIPPET_SNACKER_PREFIX} Failed to copy open files. ${error instanceof Error ? error.message : String(error)}`);
    }
}