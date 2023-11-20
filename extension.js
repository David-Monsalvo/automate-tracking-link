
const path = require('path');
const vscode = require('vscode');

function processDocument() {
    const editor = vscode.window.activeTextEditor;

    if (editor && (editor.document.languageId === 'html' || editor.document.languageId === 'htm')) {
        const document = editor.document;
        const text = document.getText();

        // Expresión regular para encontrar <a> con target="_blank" y atributo name=""
        const regex = /<a([^>]*)target="_blank"([^>]*)name="([^"]*)"([^>]*)>/g;

        // Obtiene el nombre del documento sin la extensión
        const fileName = path.basename(document.fileName, path.extname(document.fileName));

        // Reemplaza <a> con target="_blank" con la nueva línea de código
        const newText = text.replace(regex, (match, p1, p2, p3, p4) => {
            const alias = `alias="${p3}-${fileName}"`;
            return `<a${p1}target="_blank"${p2}${alias}${p4} conversion="true">`;
        });

        // Reemplaza el contenido del documento con el nuevo texto solo si hay cambios
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