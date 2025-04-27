import * as vscode from 'vscode';

export function getRelativePath(uri: vscode.Uri): string {
    return vscode.workspace.asRelativePath(uri, false); // false = don't include workspace folder name
}

// Basic check for common dependency/build folders
const DEFAULT_EXCLUDE_PATTERNS = [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/out/**',
    '**/.vscode/**',
    // Add more common patterns if needed
];

export function getWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
    return vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : undefined;
}

export function getConfiguration<T>(key: string, defaultValue: T): T {
    const config = vscode.workspace.getConfiguration('snippetSnacker');
    return config.get<T>(key, defaultValue);
}

export async function getWorkspaceFiles(
    includePattern: string = '**/*',
    excludePatterns?: string[] | null // Allow null to explicitly use no exclude
): Promise<vscode.Uri[]> {

    const excludeConfigKey = 'projectStructure.excludePatterns';
    const useGitignoreConfigKey = 'projectStructure.useGitignore';

    let effectiveExcludePatterns: string[];

    if (excludePatterns === null) {
        // Explicitly no excludes requested by caller
        effectiveExcludePatterns = [];
    } else {
        // Use provided patterns, or config patterns, or default
        effectiveExcludePatterns = excludePatterns
            ?? getConfiguration<string[]>(excludeConfigKey, DEFAULT_EXCLUDE_PATTERNS);

        // Optionally merge with .gitignore (this is a simplified approach)
        // A robust solution might involve parsing .gitignore properly
        const useGitignore = getConfiguration<boolean>(useGitignoreConfigKey, true);
        if (useGitignore) {
            // Note: findFiles respects .gitignore by default IF run from workspace root
            // and exclude isn't overly broad. For more control, parse .gitignore manually
            // This simplified version relies on findFiles' default behavior
            // Or add a glob pattern from settings if needed.
            // console.log("Using default .gitignore behavior of findFiles");
        }
    }


    // Construct the exclude glob pattern string
    const excludeGlob = effectiveExcludePatterns.length > 0 ? `{${effectiveExcludePatterns.join(',')}}` : undefined;

    // console.log("Include Pattern:", includePattern);
    // console.log("Exclude Glob:", excludeGlob);


    // Find files relative to the workspace root
    const files = await vscode.workspace.findFiles(includePattern, excludeGlob);
    // console.log(`Found ${files.length} files.`);
    return files;
}