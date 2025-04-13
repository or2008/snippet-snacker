import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Snippet Snacker is now active!');

	// Command: Copy Snippet with File Path (for selected code)
	const copySnippetDisposable = vscode.commands.registerCommand('snippet-snacker.copySnippet', async () => {
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

		// Write the snippet to the clipboard
		await vscode.env.clipboard.writeText(snippet);
		vscode.window.showInformationMessage('Snippet copied to clipboard!');
	});

	// Command: Copy All Open Documents (all open tabs)
	const copyAllDocumentsDisposable = vscode.commands.registerCommand('snippet-snacker.copyAllOpenDocuments', async () => {
		let allSnippets = "";

		// Use the tabGroups API if available (VS Code 1.64+), with fallback to visibleTextEditors
		if (vscode.window.tabGroups && vscode.window.tabGroups.all.length > 0) {
			for (const group of vscode.window.tabGroups.all) {
				for (const tab of group.tabs) {
					// Check if this tab represents a text document by verifying if it has a URI property.
					// (Using duck typing since the concrete type may not be directly available.)
					if (tab.input && (tab.input as any).uri) {
						const uri = (tab.input as any).uri as vscode.Uri;
						const document = vscode.workspace.textDocuments.find(doc => doc.uri.toString() === uri.toString());
						if (document) {
							const relativePath = vscode.workspace.asRelativePath(document.uri);
							const code = document.getText();
							allSnippets += `File: ${relativePath}\n------------------------------------------------------\n\n${code}\n\n`;
						}
					}
				}
			}
		} else {
			// Fallback: iterate over visible text editors if no tabGroups info is available
			for (const editor of vscode.window.visibleTextEditors) {
				const document = editor.document;
				const relativePath = vscode.workspace.asRelativePath(document.uri);
				const code = document.getText();
				allSnippets += `File: ${relativePath}\n------------------------------------------------------\n\n${code}\n\n`;
			}
		}

		if (!allSnippets) {
			vscode.window.showErrorMessage('No open text documents found!');
			return;
		}

		await vscode.env.clipboard.writeText(allSnippets);
		vscode.window.showInformationMessage('All open documents copied to clipboard!');
	});

	// Code Action Provider: Offer a "Copy Snippet with File Path" quick fix in the light bulb menu
	class CopySnippetCodeActionProvider implements vscode.CodeActionProvider {
		provideCodeActions(
			document: vscode.TextDocument,
			range: vscode.Range,
			context: vscode.CodeActionContext,
			token: vscode.CancellationToken
		): vscode.CodeAction[] | undefined {
			// Only offer the action when the selection (range) is not empty.
			if (range.isEmpty) {
				return;
			}

			const action = new vscode.CodeAction('Copy Snippet with File Path', vscode.CodeActionKind.QuickFix);
			action.command = {
				command: 'snippet-snacker.copySnippet',
				title: 'Copy Snippet with File Path'
			};
			return [action];
		}
	}

	// Register the Code Action Provider for all documents.
	const codeActionProviderDisposable = vscode.languages.registerCodeActionsProvider(
		'*',
		new CopySnippetCodeActionProvider(),
		{
			providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
		}
	);

	// Add subscriptions for proper disposal on extension deactivation.
	context.subscriptions.push(copySnippetDisposable, copyAllDocumentsDisposable, codeActionProviderDisposable);
}

export function deactivate() { }
