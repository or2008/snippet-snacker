![Snippet Snacker Banner](assets/banner.webp)

# Snippet Snacker

Welcome to **Snippet Snacker**—your go-to VS Code extension for effortlessly sharing code snippets and project context with AI assistants, colleagues, or your future self! Quickly grab selected code with detailed context (paths, lines, imports, problems), copy entire open files, bundle multiple files, or generate a project structure tree, all designed to streamline your workflow.

## Features

Snippet Snacker packs a punch with features accessible via the editor context menu (right-click), Code Actions (lightbulb `Ctrl+.` / `Cmd+.`), the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`), and the File Explorer context menu:

-   **Copy Selection with Context:** (Editor Context Menu / Code Action)
    *   Copies the selected code snippet.
    *   Includes the relative file path.
    *   Includes the starting and ending line numbers (e.g., `(Lines: 42-55)`).

-   **Copy Selection with Imports:** (Editor Context Menu / Code Action)
    *   Copies the selected code snippet with path and line numbers.
    *   Prepends **all** import/require statements found in the file for dependency context. *(See Known Issues)*

-   **Copy Selection with Problems:** (Editor Context Menu / Code Action)
    *   Copies the selected code snippet with path and line numbers.
    *   Appends any diagnostic problems (errors, warnings) reported by VS Code that fall within the selected lines. Perfect for asking AI "Why is this wrong?".

-   **Copy All Open Files:** (Command Palette / Editor Context Menu)
    *   Copies the *entire content* of all currently open, non-untitled files.
    *   Each file's content is clearly marked with its relative path.
    *   Warns you if you have many files open to prevent accidental large copies.

-   **Copy Project Structure Tree:** (Command Palette / Explorer Context Menu on Folders)
    *   Generates a text-based tree representation of your project's folder and file structure.
    *   Excludes common folders like `node_modules`, `.git`, etc. by default (configurable).
    *   Essential for giving LLMs an overview of the project layout.

-   **Bundle Selected Files for LLM:** (Explorer Context Menu)
    *   Select multiple files or folders in the VS Code Explorer.
    *   Right-click and choose this command to copy the full content of all selected files, each marked with its relative path.
    *   Ideal for providing multi-file context to an AI for complex questions or tasks.

-   **Nested Context Menu:**
    *   Most commands are neatly organized under the **Snippet Snacker** submenu in the editor's right-click context menu for easy access without clutter.

> **Tip:** Leverage these features to dramatically speed up context gathering for AI assistants like ChatGPT, Claude, or Copilot Chat. Provide structure, dependencies, related files, and error messages with just a few clicks!

## Requirements

-   Visual Studio Code: Version `1.75.0` or later recommended.

## Extension Settings

Snippet Snacker now includes settings to customize the project structure generation:

-   `snippetSnacker.projectStructure.excludePatterns`: (Array of strings)
    *   Glob patterns for folders/files to exclude when generating the project structure tree.
    *   Defaults: `["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**", "**/out/**", "**/.vscode/**"]`
-   `snippetSnacker.projectStructure.useGitignore`: (Boolean)
    *   Whether to respect `.gitignore` rules when generating the project structure (relies on VS Code's default file searching behavior).
    *   Default: `true`

Access these settings via `File > Preferences > Settings` and search for "Snippet Snacker".

## Known Issues

-   **Copy Selection with Imports:** This command currently includes *all* import/require statements from the top of the file, not just those specifically used by the selected code block. Determining exact usage requires more complex code analysis (AST parsing) which is not yet implemented.
-   **Clipboard Limitations:** Behavior may vary slightly between operating systems due to differences in clipboard APIs.
-   **Project Structure Filtering:** While `.gitignore` is respected by default, complex rules or deeply nested ignored files might not always be filtered perfectly by the underlying VS Code file search mechanism used.

For any other issues or unexpected behavior, please check the [GitHub issues page](https://github.com/or2008/snippet-snacker/issues) for support or to file a new one.

**Enjoy snacking on those code bites (now with extra context!) with Snippet Snacker!**