const path = require('path');
const vscode = require('vscode');

function processDocument() {
    const editor = vscode.window.activeTextEditor;

    if (editor && (editor.document.languageId === 'html' || editor.document.languageId === 'htm')) {
        const document = editor.document;
        const text = document.getText();

        // Regex to find <a> tags with target="_blank" and atributo name=""
        const regex = /<a([^>]*)target="_blank"([^>]*)name="([^"]*)"([^>]*)>/g;

        // Get the file name without the file extention
        const fileName = path.basename(document.fileName, path.extname(document.fileName));

        // Seach and validate the "name" attribute
        const newText = text.replace(regex, (match, p1, p2, p3, p4) => {
            // Validates whenter the "name" atribute is empty
            if (!p3.trim()) {
                const range = document.getText().indexOf(match);
                const position = document.positionAt(range);
                const errorMessage = `El atributo "name" no puede estar vacío. Por favor, llénelo. (Línea: ${position.line + 1}, Columna: ${position.character + 1})`;
                vscode.window.showWarningMessage(errorMessage);
                return match;
            } else {
                const alias = `alias="${p3}-${fileName}"`;
                return `<a${p1}target="_blank"${p2}${alias}${p4} conversion="true">`;
            }
        });

        // Replaces the document content with the new text only if there are changes.
        if (newText !== text) {
            editor.edit((editBuilder) => {
                const fullRange = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(text.length)
                );
                editBuilder.replace(fullRange, newText);
            });

            vscode.window.showInformationMessage('Archivo procesado.');
        }
    } else {
        vscode.window.showErrorMessage('Por favor, abra un archivo válido.');
    }
}

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.automate-tracking-link', processDocument);
    context.subscriptions.push(disposable);
}


function deactivate() { }
module.exports = {
    activate,
    deactivate
}