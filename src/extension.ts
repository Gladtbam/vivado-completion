// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { vivadoCommands, vivadoArgs } from './generated/vivadoCommands';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vivado-completion" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const provider = vscode.languages.registerCompletionItemProvider(
        ['tcl', 'xdc'], 
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

                const linePrefix = document.lineAt(position).text.substring(0, position.character);

                const match = linePrefix.match(/([a-zA-Z0-9_]+)\s+.*-$/);
                if (match) {
                    const commandName = match[1];

                    if (vivadoArgs[commandName]) {
                        return vivadoArgs[commandName].map((arg: any) => {
                            const label = arg.label || arg.name;
                            
                            const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Property);
                            
                            if (arg.documentation) { item.documentation = arg.documentation; }
                            if (arg.description) { item.documentation = new vscode.MarkdownString(arg.description); }
                            if (arg.detail) { item.detail = arg.detail; }

                            if (typeof label === 'string' && label.startsWith('-')) {
                                item.insertText = label.substring(1);
                            }

                            return item;
                        });
                    }
                }

                return vivadoCommands;
            }
        },
        '-', ' '
    );

    context.subscriptions.push(provider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
