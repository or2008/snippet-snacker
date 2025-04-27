import * as vscode from 'vscode';
import { getRelativePath } from '../utils/fileUtils';
import { copyToClipboard } from '../utils/clipboard';
import { MAX_BUNDLE_WARN_THRESHOLD, SNIPPET_SNACKER_PREFIX } from '../constants';

export async function bundleSelectedFiles(
    clickedUri: vscode.Uri | undefined, // URI of the item right-clicked
    selectedUris: vscode.Uri[] | undefined // All selected URIs in the Explorer
): Promise<void> {

    const urisToBundle = selectedUris ?? (clickedUri ? [clickedUri] : []);

    if (!urisToBundle || urisToBundle.length === 0) {
        vscode.window.showInformationMessage(`${SNIPPET_SNACKER_PREFIX} No files selected in the Explorer.`);
        return;
    }

    // Filter out potential folders if they sneak in (though command 'when' clause helps)
    const fileUris: vscode.Uri[] = [];
    for (const uri of urisToBundle) {
        try {
            const stats = await vscode.workspace.fs.stat(uri);
            if (stats.type === vscode.FileType.File) {
                fileUris.push(uri);
            }
        } catch (err) {
            // Ignore errors like file not found if selection is stale
            console.warn(`Snippet Snacker: Could not stat file ${uri.fsPath}, skipping.`, err);
        }
    }


    if (fileUris.length === 0) {
        vscode.window.showInformationMessage(`${SNIPPET_SNACKER_PREFIX} No valid files selected to bundle.`);
        return;
    }


    if (fileUris.length > MAX_BUNDLE_WARN_THRESHOLD) {
        const choice = await vscode.window.showWarningMessage(
            `${SNIPPET_SNACKER_PREFIX} You selected ${fileUris.length} files. This might generate a large amount of text. Continue?`,
            { modal: true },
            'Bundle Anyway',
            'Cancel'
        );
        if (choice !== 'Bundle Anyway') {
            vscode.window.showInformationMessage(`${SNIPPET_SNACKER_PREFIX} Bundle operation cancelled.`);
            return;
        }
    }


    let combinedContent = '';
    const separator = '\n\n---\n\n';

    try {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `${SNIPPET_SNACKER_PREFIX} Bundling ${fileUris.length} files...`,
            cancellable: true // Allow cancellation for large bundles
        }, async (progress, token) => {

            for (let i = 0; i < fileUris.length; i++) {
                if (token.isCancellationRequested) {
                    vscode.window.showInformationMessage(`${SNIPPET_SNACKER_PREFIX} Bundle operation cancelled by user.`);
                    combinedContent = ''; // Clear partial content
                    return;
                }

                const uri = fileUris[i];
                const relativePath = getRelativePath(uri);
                progress.report({ message: `Reading ${relativePath}...`, increment: (1 / fileUris.length) * 100 });

                try {
                    const fileContentBytes = await vscode.workspace.fs.readFile(uri);
                    const fileContent = new TextDecoder().decode(fileContentBytes);

                    if (fileContent.trim()) { // Only add non-empty files
                        combinedContent += `// File: ${relativePath}\n${fileContent}${separator}`;
                    }
                } catch (fileError) {
                    console.error(`Snippet Snacker Error reading file ${relativePath}:`, fileError);
                    combinedContent += `// File: ${relativePath}\n// Error reading file: ${fileError instanceof Error ? fileError.message : String(fileError)}\n${separator}`;
                }
            }

            // Remove the last separator
            if (combinedContent.endsWith(separator)) {
                combinedContent = combinedContent.slice(0, -separator.length);
            }

            if (combinedContent && !token.isCancellationRequested) {
                await copyToClipboard(combinedContent, `Bundled content of ${fileUris.length} file(s)!`);
            } else if (!token.isCancellationRequested) {
                vscode.window.showWarningMessage(`${SNIPPET_SNACKER_PREFIX} No content found in selected files.`);
            }
        });


    } catch (error) {
        console.error("Snippet Snacker Error (bundleSelectedFiles):", error);
        vscode.window.showErrorMessage(`${SNIPPET_SNACKER_PREFIX} Failed to bundle selected files. ${error instanceof Error ? error.message : String(error)}`);
    }
}