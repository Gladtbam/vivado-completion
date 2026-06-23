const fs = require('fs');
const path = require('path');

const commandsDir = path.join(__dirname, '../data/commands');
const outputDir = path.join(__dirname, '../src/generated');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 准备生成的 TS 文件头
let tsContent = `// ⚠️ 此文件由打包脚本自动生成，请勿直接修改。\n`;
tsContent += `import * as vscode from 'vscode';\n\n`;

let cmdItems = `export const vivadoCommands: vscode.CompletionItem[] = [\n`;
let argDict = `export const vivadoArgs: Record<string, vscode.CompletionItem[]> = {\n`;

// 遍历所有的单文件指令
const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
    const filePath = path.join(commandsDir, file);
    const cmdData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 如果存在人工覆写的 snippet，就用人工的，否则用默认的
    const insertText = cmdData.custom_snippet ? 
        `new vscode.SnippetString(\`${cmdData.custom_snippet}\`)` : 
        `new vscode.SnippetString('${cmdData.name} $0')`;

    // 组装顶级命令
    cmdItems += `    {\n`;
    cmdItems += `        label: '${cmdData.name}',\n`;
    cmdItems += `        kind: vscode.CompletionItemKind.Function,\n`;
    cmdItems += `        detail: ${JSON.stringify(cmdData.short_description)},\n`;
    cmdItems += `        insertText: ${insertText},\n`;
    cmdItems += `        documentation: new vscode.MarkdownString(${JSON.stringify(cmdData.full_help)})\n`;
    cmdItems += `    },\n`;

    // 组装参数
    if (cmdData.arguments && cmdData.arguments.length > 0) {
        argDict += `    "${cmdData.name}": [\n`;
        cmdData.arguments.forEach(arg => {
            argDict += `        { label: '${arg.flag}', detail: ${JSON.stringify(arg.description)}, kind: vscode.CompletionItemKind.EnumMember },\n`;
        });
        argDict += `    ],\n`;
    }
});

cmdItems += `];\n\n`;
argDict += `};\n`;

fs.writeFileSync(path.join(outputDir, 'vivadoCommands.ts'), tsContent + cmdItems + argDict);
console.log(`✅ 成功将 ${files.length} 个指令打包为 src/generated/vivadoCommands.ts`);