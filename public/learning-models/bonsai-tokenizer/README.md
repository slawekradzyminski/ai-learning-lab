# Bonsai base tokenizer assets

These files are a pinned local copy of the tokenizer used by Bonsai's Qwen 3.6 base model. They let the tokenization lesson run deterministically in the browser without sending training text to a third party.

- Source: `Qwen/Qwen3.6-27B`
- Exact revision and file hashes: `manifest.json`
- Refresh command: `npm run fetch:bonsai-tokenizer`
- Model license information: <https://huggingface.co/Qwen/Qwen3.6-27B>

Do not edit the generated JSON files by hand. Update the pinned revision in `scripts/fetch-bonsai-tokenizer.mjs`, rerun the script, and review the changed hashes.
