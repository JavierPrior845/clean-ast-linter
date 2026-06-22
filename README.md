# Clean AST Linter (VS Code Extension)

A deterministic, local, and agnostics-ready static analysis tool for VS Code. This extension parses your code using Tree-sitter AST to enforce clean code principles and prevent structural degradation ("AI Slop") in real-time.

## Project Scope (MVP)
The extension will monitor the active file and trigger visual warnings (Diagnostics) when the following thresholds—derived from Robert C. Martin's *Clean Code*—are breached:

1. **Function Length:** Warning if a function/method exceeds **50 lines** (*Clean Code: Functions should be small*).
2. **Parameter Count:** Warning if a function signature accepts more than **4 arguments** (*Clean Code: Ideal arguments are 0 to 2*).
3. **Cyclomatic Complexity (McCabe Index):** Warning if a function contains more than **10 logical decision paths** (`if`, `for`, `while`, `catch`).

## Future Extensions (Post-MVP)
4. **Algorithmic Complexity Estimation (Big-O Notation):** - Detect performance bottlenecks like $O(N^2)$ or higher by identifying nested loop structures (`for`, `while`) via AST structural analysis.
   - Alert the developer when non-linear time complexity is detected in a single block, encouraging the use of HashMaps or optimized search algorithms.
5. **Local AI-Assisted Quick Fixes (Future Phase):**
   - Integrate a lightweight, local LLM (e.g., Qwen-2.5-Coder-1.5B via Ollama) to automatically refactor code blocks that breach clean code thresholds.
   - Leverage Tree-sitter to surgically replace only the target AST function node, ensuring zero network latency and maximum code privacy.

## Supported Languages (Initial Phase)
* Python (`.py`)
* TypeScript / JavaScript (`.ts`, `.js`)

## Architecture
This is a 100% offline extension executing on the VS Code Extension Host using `web-tree-sitter` (WebAssembly). It features a debounced document listener to achieve near-zero CPU overhead during active typing.