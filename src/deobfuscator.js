import { promises as fs } from 'fs';

async function ReadFile(filename) {
  try {
    const data = await fs.readFile(`./${filename}`, 'utf8');
    return data;
  } catch (err) {
    console.error('Error during opening file:', err);
    return null;
  }
}

async function WriteFile(content) {
  try {
    await fs.writeFile("deob.js", content, 'utf8');
  } catch (err) {
    console.error('Error during writing file:', err);
  }
}

async function deobfuscate(body) {
  try {
    
    const re = /var\s+(_[^=\s]+)\s*=\s*\[([\s\S]*?)\];/g;
    
    let match;
    let modifiedBody = body;
    let arraysToRemove = [];
    
    while ((match = re.exec(body)) !== null) {
      try {
        if (re.lastIndex === match.index) {
          re.lastIndex++;
          continue;
        }
        
        const arrayName = match[1];
        const fullArrayDeclaration = match[0];
        arraysToRemove.push(fullArrayDeclaration);
        
        const valuesString = match[2];
        const values = parseArrayValues(valuesString);
        
        const findPattern = new RegExp(String.raw`${escapeRegExp(arrayName)}\s*\[\s*(\d+)\s*\]`, 'g');
        
        let m;
        while ((m = findPattern.exec(modifiedBody)) !== null) {
          try {
            const fullMatch = m[0];
            const index = parseInt(m[1], 10);
            
            if (index >= 0 && index < values.length) {
              const replacement = values[index];
              modifiedBody = modifiedBody.replace(fullMatch, replacement);
              
              findPattern.lastIndex = 0;
            }
          } catch (substitutionError) {
            console.error(`Error during replace for ${arrayName}[${m[1]}]:`, substitutionError);
          }
        }
      } catch (arrayError) {
        console.error(`Error elaborating array ${match[1]}:`, arrayError);
      }
    }
    

    for (const arrayDecl of arraysToRemove) {
      modifiedBody = modifiedBody.replace(arrayDecl, '');
    }

    return modifiedBody;
  } catch (error) {
    console.error("Error during deob:", error);
    return body;
  }
}

function parseArrayValues(valuesString) {
  const values = [];
  let inString = false;
  let stringChar = '';
  let currentValue = '';
  let brackets = 0;
  let escaped = false;
  
  for (let i = 0; i < valuesString.length; i++) {
    const char = valuesString[i];
    
    if (escaped) {
      currentValue += char;
      escaped = false;
      continue;
    }
    
    if (char === '\\') {
      currentValue += char;
      escaped = true;
    } else if (!inString && (char === "'" || char === '"')) {
      inString = true;
      stringChar = char;
      currentValue += char;
    } else if (inString && char === stringChar) {
      inString = false;
      currentValue += char;
    } else if (!inString && char === '[') {
      brackets++;
      currentValue += char;
    } else if (!inString && char === ']') {
      brackets--;
      currentValue += char;
    } else if (!inString && char === ',' && brackets === 0) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  if (currentValue.trim()) {
    values.push(currentValue.trim());
  }
  
  return values;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function main() {


  const filename = process.argv[2];
  
  if (!filename) {
    console.error('Please provide a filename.');
    return;
  }
  
  console.log(`Starting deobfuscator for file: ${filename}`);
  let body = await ReadFile(filename);
  
  if (!body) {
    console.error('Unable to read file.');
    return;
  }
  
  const startTime = Date.now();
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), 30000);
  });
  
  try {
    const deobfuscated = await Promise.race([
      deobfuscate(body),
      timeoutPromise
    ]);
    
    console.log(`Deobfuscation completed in ${(Date.now() - startTime) / 1000} seconds.`);
    await WriteFile(deobfuscated);
  } catch (error) {
    console.error('Error during process:', error.message);
  }
}

main();
