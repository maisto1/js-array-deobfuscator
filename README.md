# JavaScript Deobfuscator

A Node.js tool for deobfuscating JavaScript code by replacing array-based variable substitutions with their actual values.

## Features

- Identifies and resolves array-based obfuscation patterns
- Replaces array references with their actual string values
- Cleans up the code by removing unused array declarations
- Command-line interface for easy usage
- Timeout protection for processing large files

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/js-array-deobfuscator.git

# Navigate to the project directory
cd js-array-deobfuscator

```

## Usage

Run the deobfuscator with a JavaScript file as input:

```bash
node src/deobfuscator.js path/to/obfuscated.js
```

The deobfuscated result will be saved as `path/to/deob.js`.

## How It Works

This tool specifically targets a common obfuscation technique where string values are stored in arrays and referenced by index throughout the code. For example:

```javascript
// Obfuscated code
var _0x1234 = ['value1', 'value2', 'function'];
console[_0x1234[2]](_0x1234[0] + _0x1234[1]);

// Deobfuscated result
console['function']('value1' + 'value2');
```

The deobfuscator:
1. Identifies array declarations
2. Extracts array values
3. Finds all references to array elements
4. Replaces references with the actual values
5. Removes the original array declarations

## Limitations

- Focuses specifically on array-based obfuscation patterns
- May not handle dynamically calculated array indices
- Has a 30-second timeout for processing (configurable)
- Designed for Node.js environment

## Examples

Before:
```javascript
var _0x5a2b = ['log', 'Hello', 'World'];
console[_0x5a2b[0]](_0x5a2b[1] + ' ' + _0x5a2b[2]);
```

After:
```javascript
console['log']('Hello' + ' ' + 'World');
```

## Acknowledgments

- Inspired by the need to analyze obfuscated JavaScript malware
- Thanks to the open-source community for various parsing techniques
