# Clean AST Linter (VS Code Extension)

A deterministic, local, and agnostics-ready static analysis tool for VS Code. This extension parses your code using Tree-sitter AST to enforce clean code principles and prevent structural degradation ("AI Slop") in real-time.

## Project Scope (MVP)
The extension will monitor the active file and trigger visual warnings (Diagnostics) when the following thresholds—derived from Robert C. Martin's *Clean Code*—are breached:

1. **Function Length:** Warning if a function/method exceeds **50 lines** (*Clean Code: Functions should be small*).
2. **Parameter Count:** Warning if a function signature accepts more than **4 arguments** (*Clean Code: Ideal arguments are 0 to 2*).
3. **Cyclomatic Complexity (McCabe Index):** Warning if a function contains more than **10 logical decision paths** (`if`, `for`, `while`, `catch`).

## Killer Feature: Local AI Refactoring
This extension integrates a local AI agent (via **Ollama**) to act as your personal Clean Code assistant.
- **Code Actions (Quick Fixes)**: When a function violates a metric (e.g., Cyclomatic Complexity > 10), a lightbulb 💡 appears offering to "Refactor with Local AI (Ollama)".
- **Privacy First**: Code is sent exclusively to your local Ollama instance (default: `http://localhost:11434`), ensuring absolute zero network latency and maximum codebase privacy.
- **Pluggable Architecture**: Built with an `IAIService` interface, making it easily extensible to other providers (OpenAI, Anthropic, etc.) in the future.

## Future Extensions (Post-MVP)
4. **Algorithmic Complexity Estimation (Big-O Notation):** 
   - Detect performance bottlenecks like $O(N^2)$ or higher by identifying nested loop structures (`for`, `while`) via AST structural analysis.
   - Alert the developer when non-linear time complexity is detected in a single block, encouraging the use of HashMaps or optimized search algorithms.

## Supported Languages (Dynamic MVP Phase)
* TypeScript / TSX (`.ts`, `.tsx`)
* Python (`.py`)

The extension dynamically loads the appropriate WebAssembly parser (`tree-sitter-typescript.wasm` or `tree-sitter-python.wasm`) and AST queries based on the language of the active editor window.

## Configuration Settings
Users can customize the thresholds natively within their VS Code `settings.json`:
* `cleanAstLinter.maxFunctionLines`: Default 50
* `cleanAstLinter.maxParameters`: Default 4
* `cleanAstLinter.maxComplexity`: Default 10
* `cleanAstLinter.aiEndpoint`: Default `http://localhost:11434` (URL of your local Ollama instance)
* `cleanAstLinter.aiModel`: Default `qwen2.5-coder:1.5b` (Recommended model for fast, local refactoring)

## Architecture
This is a 100% offline extension executing on the VS Code Extension Host using `web-tree-sitter` (WebAssembly). It features:
* **Single-Pass Query Optimization**: Eliminates O(N^2) WASM evaluation bottlenecks by running S-expression queries only once per file and filtering coordinate ranges natively in JavaScript memory.
* **Per-Document Debouncing**: Uses a Map of timers to ensure isolated debouncing without race conditions, even when multiple files or background panels are actively updated.
* **Dynamic Language Switching**: Caches WebAssembly tree-sitter instances per language to minimize RAM overhead.
* **WASM Memory Management**: Safely cleans up the C emulator memory bounds using internal garbage collection to prevent memory leaks in VS Code.
* **Non-Blocking Listeners**: Achieves near-zero CPU overhead during active typing by debouncing the AST traversal synchronously.