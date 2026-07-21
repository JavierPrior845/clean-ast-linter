# Clean AST Linter (VS Code Extension)

A deterministic, local, and privacy-first static analysis tool for Visual Studio Code. This extension parses your code using Tree-sitter AST to enforce Clean Code principles in real-time, and provides **Local AI-assisted Code Actions** to automatically refactor your messy functions without sending a single line of code to the cloud.

---

## 🚀 Workflow

The linter works completely transparently and reactively as you type:

1. **Real-Time Analysis:** When opening or modifying a file (TS, TSX, or Python), the extension loads the corresponding WebAssembly grammar and builds an Abstract Syntax Tree (AST) of your code in mere milliseconds.
2. **Metrics Evaluation:** Single-pass search patterns (S-Expressions) are applied over the AST to locate functions and evaluate their properties (length, parameters, complexity).
3. **Visual Feedback:** If a metric exceeds the configured thresholds, the extension underlines the offending function directly in your editor (Diagnostics), reporting the exact issue.
4. **Auto-Refactoring (Quick Fix):** By clicking the VS Code lightbulb (💡) over the warning, you can invoke the local AI agent to automatically rewrite and clean the function, applying the solution directly to the file.

---

## 🎯 Project Scope (MVP)

The extension monitors the active file and triggers visual warnings (Diagnostics) when the following thresholds—derived from Robert C. Martin's *Clean Code*—are breached:

1. **Function Length:** Warning if a function/method exceeds the maximum allowed lines (*Clean Code: Functions should be small*).
2. **Parameter Count:** Warning if a function signature accepts too many arguments (*Clean Code: Ideal arguments are 0 to 2*).
3. **Cyclomatic Complexity (McCabe Index):** Warning if a function contains too many logical decision paths (`if`, `for`, `while`, `catch`).

---

## 🧠 Killer Feature: Local AI Refactoring

This extension integrates a local AI agent (via **Ollama**) to act as your personal Clean Code assistant.

- **Code Actions (Quick Fixes)**: When a function violates a metric, a lightbulb 💡 appears offering to *"Refactor with Local AI (Ollama)"*.
- **Privacy First**: Code is sent exclusively to your local Ollama instance running on your machine. Absolutely zero network latency and maximum codebase privacy.
- **Surgical Precision**: Leveraging the boundaries provided by Tree-sitter, the extension extracts and replaces *only* the specific function node, without breaking the rest of your file or its formatting.
- **Pluggable Architecture**: Built around an `IAIService` interface, making it easily extensible to other providers (OpenAI, Anthropic, etc.) by just plugging a new class in the codebase.

---

## ⚙️ Configuration (Customize your limits)

All metric thresholds and the AI integration are 100% customizable through native VS Code settings.

To access these settings:
1. Open VS Code **Settings** (`Ctrl + ,` or `Cmd + ,`).
2. Type `Clean Ast Linter` in the search bar.
3. You can also edit your `settings.json` file directly by adding the following keys:

### Clean Code Metrics
* `cleanAstLinter.maxFunctionLines`: Maximum allowed lines per function. *(Default: 50)*
* `cleanAstLinter.maxParameters`: Maximum allowed arguments. *(Default: 4)*
* `cleanAstLinter.maxComplexity`: Maximum cyclomatic complexity limit per function. *(Default: 10)*

### Local AI Integration
* `cleanAstLinter.aiEndpoint`: URL of the Ollama server. If you run Ollama on your local machine, you don't need to change this. *(Default: `http://localhost:11434`)*
* `cleanAstLinter.aiModel`: The exact name of the model downloaded in Ollama. We recommend small models optimized for code. *(Default: `qwen2.5-coder:1.5b`)*

---

## 🛠️ How to Activate the Extension (Development)

If you want to test or modify the source code of this extension:

1. Clone this repository and open it in Visual Studio Code.
2. Open the integrated terminal and install dependencies:
   ```bash
   npm install
   ```
3. Press **F5** (Run > Start Debugging).
4. A new VS Code window named **[Extension Development Host]** will open.
5. In this new window, open any `.ts` or `.py` file and start writing spaghetti code. The extension will jump into action immediately!

*(Note: To use the AI feature, make sure you have [Ollama](https://ollama.com/) installed and the specified model downloaded using `ollama run <model-name>` in your terminal).*

---

## 🌐 Supported Languages (Dynamic MVP Phase)
* TypeScript / TSX (`.ts`, `.tsx`)
* Python (`.py`)

The extension dynamically loads the appropriate WebAssembly parser (`tree-sitter-typescript.wasm` or `tree-sitter-python.wasm`) and AST queries based on the language of the active editor window.

---

## 🏗️ Architecture & Performance
This is a 100% offline extension executing on the VS Code Extension Host using `web-tree-sitter` (WebAssembly). It features:
* **Single-Pass Query Optimization**: Eliminates O(N^2) WASM evaluation bottlenecks by running S-expression queries only once per file and filtering coordinate ranges natively in JavaScript memory.
* **Per-Document Debouncing**: Uses a Map of timers to ensure isolated debouncing without race conditions, even when multiple files or background panels are actively updated.
* **Dynamic Language Switching**: Caches WebAssembly tree-sitter instances per language to minimize RAM overhead.
* **WASM Memory Management**: Safely cleans up the C emulator memory bounds using internal garbage collection to prevent memory leaks in VS Code.
* **Non-Blocking Listeners**: Achieves near-zero CPU overhead during active typing by debouncing the AST traversal synchronously.

---

## 🔮 Future Extensions (Post-MVP)
- **Algorithmic Complexity Estimation (Big-O Notation):** 
   - Detect performance bottlenecks like $O(N^2)$ or higher by identifying nested loop structures (`for`, `while`) via AST structural analysis.
   - Alert the developer when non-linear time complexity is detected in a single block, encouraging the use of HashMaps or optimized search algorithms.