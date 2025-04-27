// Central place for constants
export const SNIPPET_SNACKER_PREFIX = 'Snippet Snacker:';
export const MAX_FILES_WARN_THRESHOLD = 10;
export const MAX_BUNDLE_WARN_THRESHOLD = 15; // Warning threshold for bundle selection

// Command IDs
export const COMMAND_IDS = {
    COPY_SELECTION_WITH_PATH: 'snippetSnacker.copySelectionWithPath',
    COPY_SELECTION_WITH_IMPORTS: 'snippetSnacker.copySelectionWithImports',
    COPY_SELECTION_WITH_PROBLEMS: 'snippetSnacker.copySelectionWithProblems',
    COPY_ALL_OPEN_FILES: 'snippetSnacker.copyAllOpenFiles',
    COPY_PROJECT_STRUCTURE: 'snippetSnacker.copyProjectStructure',
    BUNDLE_SELECTED_FILES: 'snippetSnacker.bundleSelectedFiles',
};
