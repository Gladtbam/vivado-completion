const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../data/vivado_api_schema.json');
const rawData = fs.readFileSync(schemaPath, 'utf8');

let inString = false;
let cleanedData = '';
for (let i = 0; i < rawData.length; i++) {
    let char = rawData[i];
    if (char === '"' && rawData[i - 1] !== '\\') inString = !inString;
    if (inString) {
        if (char === '\n') cleanedData += '\\n';
        else if (char === '\r') cleanedData += '\\r';
        else if (char === '\t') cleanedData += '\\t';
        else cleanedData += char;
    } else {
        cleanedData += char;
    }
}

const commands = JSON.parse(cleanedData);
const outputDir = path.join(__dirname, '../data/commands');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

commands.forEach(cmdObj => {
    const cmdName = cmdObj.command;
    const fullText = cmdObj.description || "";
    
    let shortDesc = "";
    const descMatch = fullText.match(/Description:\s*\n([\s\S]*?)(?=\n\nSyntax:|\n\nUsage:|$)/);
    if (descMatch) {
        shortDesc = descMatch[1].trim().replace(/\n/g, ' ');
    }

    let argsArray = [];
    const usageMatch = fullText.match(/Usage:\s*\n([\s\S]*?)(?=\n\nCategories:|$)/);
    
    if (usageMatch) {
        const usageText = usageMatch[1];
        const lines = usageText.split(/\r?\n/); 
        
        let currentArg = null;

        for (let line of lines) {
            if (line.includes('---') || line.match(/^\s*Name\s+Description/)) {
                continue;
            }

            const flagMatch = line.match(/^\s*\[?(-[a-zA-Z0-9_]+)\]?\s+(.*)/);
            const positionalMatch = line.match(/^\s*\[?(<[a-zA-Z0-9_]+>)\]?\s+(.*)/);

            if (flagMatch) {
                currentArg = {
                    flag: flagMatch[1],
                    description: flagMatch[2].trim()
                };
                argsArray.push(currentArg);
            } else if (positionalMatch) {
                currentArg = null;
            } else if (currentArg && line.trim().length > 0) {
                currentArg.description += " " + line.trim();
            }
        }
    }

    const commandData = {
        name: cmdName,
        short_description: shortDesc,
        full_help: fullText,
        custom_snippet: null, 
        arguments: argsArray
    };

    fs.writeFileSync(path.join(outputDir, `${cmdName}.json`), JSON.stringify(commandData, null, 2));
});

console.log(`🎉 跨行提取与空数组 Bug 修复完毕！`);