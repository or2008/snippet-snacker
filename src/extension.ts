import * as vscode from 'vscode';
import { COMMAND_IDS } from './constants';

// Import Command Handlers
import { copySelectionWithPath } from './commands/copySelectionWithPath';
import { copyAllOpenFiles } from './commands/copyAllOpenFiles';
import { copyProjectStructure } from './commands/copyProjectStructure';
import { bundleSelectedFiles } from './commands/bundleSelectedFiles';
import { copySelectionWithProblems } from './commands/copySelectionWithProblems';
import { copySelectionWithImports } from './commands/copySelectionWithImports';

// Import Providers
import { SnippetSnackerCodeActionProvider } from './providers/CodeActionProvider';

// Central registration function
function registerCommands(context: vscode.ExtensionContext) {
	const commandMappings: { [key: string]: (...args: any[]) => any } = {
		[COMMAND_IDS.COPY_SELECTION_WITH_PATH]: copySelectionWithPath,
		[COMMAND_IDS.COPY_ALL_OPEN_FILES]: copyAllOpenFiles,
		[COMMAND_IDS.COPY_PROJECT_STRUCTURE]: copyProjectStructure,
		[COMMAND_IDS.BUNDLE_SELECTED_FILES]: bundleSelectedFiles,
		[COMMAND_IDS.COPY_SELECTION_WITH_PROBLEMS]: copySelectionWithProblems,
		[COMMAND_IDS.COPY_SELECTION_WITH_IMPORTS]: copySelectionWithImports,
	};

	for (const [commandId, handler] of Object.entries(commandMappings)) {
		const disposable = vscode.commands.registerCommand(commandId, handler);
		context.subscriptions.push(disposable);
	}
}

function registerProviders(context: vscode.ExtensionContext) {
	// Register Code Action Provider for all languages ('*')
	const codeActionProviderDisposable = vscode.languages.registerCodeActionsProvider(
		'*',
		new SnippetSnackerCodeActionProvider(),
		{
			providedCodeActionKinds: SnippetSnackerCodeActionProvider.providedCodeActionKinds
		}
	);
	context.subscriptions.push(codeActionProviderDisposable);

	// Register other providers here if needed (e.g., HoverProvider)
}


// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, "snippet-snacker" is now active!');

	registerCommands(context);
	registerProviders(context);

	// You could potentially register status bar items or other UI elements here
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('"snippet-snacker" deactivated.');
	// Perform any cleanup needed, although subscriptions handle command disposal
}
