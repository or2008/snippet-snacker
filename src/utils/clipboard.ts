import * as vscode from 'vscode';
import { SNIPPET_SNACKER_PREFIX } from '../constants';


export async function copyToClipboard(text: string, successMessage?: string): Promise<void> {
    try {
        await vscode.env.clipboard.writeText(text);
        if (successMessage) {
            vscode.window.showInformationMessage(`${SNIPPET_SNACKER_PREFIX} ${successMessage}`);
        }
    } catch (error) {
        console.error("Snippet Snacker Clipboard Error:", error);
        vscode.window.showErrorMessage(`${SNIPPET_SNACKER_PREFIX} Failed to copy to clipboard. ${error instanceof Error ? error.message : String(error)}`);
    }
}