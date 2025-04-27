import * as vscode from 'vscode';
import { getWorkspaceFiles, getRelativePath, getWorkspaceFolder } from '../utils/fileUtils';
import { copyToClipboard } from '../utils/clipboard';
import { SNIPPET_SNACKER_PREFIX } from '../constants';

interface FileTreeNode {
    [key: string]: FileTreeNode | string; // string for files, object for directories
}

function buildFileTree(files: vscode.Uri[], rootPath: string): FileTreeNode {
    const tree: FileTreeNode = {};

    // Ensure root path ends with a slash for consistent splitting
    const normalizedRoot = rootPath.endsWith('/') ? rootPath : rootPath + '/';

    const sortedPaths = files
        .map(uri => getRelativePath(uri))
        .sort(); // Sort paths alphabetically

    for (const relativePath of sortedPaths) {
        const parts = relativePath.split('/');
        let currentLevel = tree;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLastPart = i === parts.length - 1;

            if (isLastPart) {
                // It's a file
                currentLevel[part] = 'file'; // Mark as file
            } else {
                // It's a directory
                if (!currentLevel[part]) {
                    currentLevel[part] = {}; // Create directory node if it doesn't exist
                }
                // Type assertion needed because TS can't guarantee it's not a string ('file') here
                currentLevel = currentLevel[part] as FileTreeNode;
            }
        }
    }
    return tree;
}

function formatTree(node: FileTreeNode, prefix: string = '', isLast: boolean = true): string {
    let output = '';
    const keys = Object.keys(node).sort(); // Sort directory contents
    const totalItems = keys.length;

    keys.forEach((key, index) => {
        const currentIsLast = index === totalItems - 1;
        const connector = currentIsLast ? '└── ' : '├── ';
        const item = node[key];

        output += `${prefix}${connector}${key}\n`;

        if (typeof item === 'object') { // It's a directory
            const newPrefix = prefix + (currentIsLast ? '    ' : '│   ');
            output += formatTree(item, newPrefix, currentIsLast);
        }
        // 'file' nodes are handled by just printing the key above
    });

    return output;
}


export async function copyProjectStructure(): Promise<void> {
    const workspaceFolder = getWorkspaceFolder();
    if (!workspaceFolder) {
        vscode.window.showWarningMessage(`${SNIPPET_SNACKER_PREFIX} No workspace folder open.`);
        return;
    }

    try {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `${SNIPPET_SNACKER_PREFIX} Generating project structure...`,
            cancellable: false
        }, async (progress) => {

            const files = await getWorkspaceFiles(); // Uses util which reads config for excludes

            if (files.length === 0) {
                vscode.window.showWarningMessage(`${SNIPPET_SNACKER_PREFIX} No files found in workspace (check exclude settings?).`);
                return;
            }

            const fileTree = buildFileTree(files, workspaceFolder.uri.fsPath);
            const rootDirName = workspaceFolder.name;
            const formattedTree = `${rootDirName}/\n${formatTree(fileTree)}`;

            await copyToClipboard(formattedTree, 'Copied project structure tree!');
        });
    } catch (error) {
        console.error("Snippet Snacker Error (copyProjectStructure):", error);
        vscode.window.showErrorMessage(`${SNIPPET_SNACKER_PREFIX} Failed to generate project structure. ${error instanceof Error ? error.message : String(error)}`);
    }
}