import * as vscode from 'vscode';
import { COMMAND_IDS } from '../constants';

export class SnippetSnackerCodeActionProvider implements vscode.CodeActionProvider {

    public static readonly providedCodeActionKinds = [
        // Add more kinds if needed, e.g., QuickFix if providing fixes
        vscode.CodeActionKind.RefactorExtract, // More specific kind if applicable
        vscode.CodeActionKind.Refactor // General fallback
    ];

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {

        // Only provide actions if there is a non-empty selection
        if (range.isEmpty) {
            return undefined;
        }

        // Basic Copy Action
        const copySelectionAction = new vscode.CodeAction(
            `Snippet Snacker: Copy Selection with Path`, // More descriptive title
            vscode.CodeActionKind.RefactorExtract // Can use a relevant kind
        );
        copySelectionAction.command = {
            command: COMMAND_IDS.COPY_SELECTION_WITH_PATH,
            title: 'Copy Selection with Path',
            tooltip: 'Copies the selected text along with the relative file path and line numbers.',
            arguments: [document.uri, range]
        };


        // Copy with Imports Action
        const copyWithImportsAction = new vscode.CodeAction(
            `Snippet Snacker: Copy Selection with Imports`,
            vscode.CodeActionKind.RefactorExtract
        );
        copyWithImportsAction.command = {
            command: COMMAND_IDS.COPY_SELECTION_WITH_IMPORTS,
            title: 'Copy Selection with Imports',
            tooltip: 'Copies selection, path, lines, and all imports from the file.',
            arguments: [document.uri, range]
        };

        // Copy with Problems Action
        const copyWithProblemsAction = new vscode.CodeAction(
            `Snippet Snacker: Copy Selection with Problems`,
            vscode.CodeActionKind.RefactorExtract
        );
        copyWithProblemsAction.command = {
            command: COMMAND_IDS.COPY_SELECTION_WITH_PROBLEMS,
            title: 'Copy Selection with Problems',
            tooltip: 'Copies selection, path, lines, and any problems within the selected lines.',
            arguments: [document.uri, range]
        };


        // --- Add other relevant actions here if desired ---


        // Return actions - they appear in the lightbulb menu
        return [
            copySelectionAction,
            copyWithImportsAction,
            copyWithProblemsAction,
        ];
    }
}
