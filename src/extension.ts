import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Snippet Snacker is now active!');

	// Command: Copy Selected Snippet (overwrites clipboard)
	const copySnippetDisposable = vscode.commands.registerCommand('snippet-snacker.copySelectedSnippet', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found!');
			return;
		}
		const selection = editor.selection;
		if (selection.isEmpty) {
			vscode.window.showErrorMessage('No code selected!');
			return;
		}
		
		const document = editor.document;
		// Get the file path relative to the workspace root
		const relativePath = vscode.workspace.asRelativePath(document.uri);
		// Get the selected code text
		const selectedCode = document.getText(selection);
		// Format the snippet
		const snippet = `File: ${relativePath}\n------------------------------------------------------\n\n${selectedCode}`;

		// Write the snippet to the clipboard (overwrites any existing content)
		await vscode.env.clipboard.writeText(snippet);
		vscode.window.showInformationMessage('Snippet copied to clipboard!');
	});

	// Command: Copy and Append Selected Snippet (appends to existing clipboard content)
	const appendSnippetDisposable = vscode.commands.registerCommand('snippet-snacker.copyAndAppendSelectedSnippet', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found!');
			return;
		}
		const selection = editor.selection;
		if (selection.isEmpty) {
			vscode.window.showErrorMessage('No code selected!');
			return;
		}
		
		const document = editor.document;
		const relativePath = vscode.workspace.asRelativePath(document.uri);
		const selectedCode = document.getText(selection);
		// Format the snippet with a trailing newline for separation
		const snippet = `File: ${relativePath}\n------------------------------------------------------\n\n${selectedCode}\n`;

		// Read the current clipboard content
		const currentClipboard = await vscode.env.clipboard.readText();
		// Append the new snippet to the current clipboard content
		const newClipboard = currentClipboard ? `${currentClipboard}\n${snippet}` : snippet;

		// Write the updated content back to the clipboard
		await vscode.env.clipboard.writeText(newClipboard);
		vscode.window.showInformationMessage('Snippet appended to clipboard!');
	});

	context.subscriptions.push(copySnippetDisposable, appendSnippetDisposable);
}

export function deactivate() {}
