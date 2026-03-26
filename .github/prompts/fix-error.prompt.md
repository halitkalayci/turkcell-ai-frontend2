---
name: fix-error
description: Bir hata yaşadığında hata çıktısı ve opsiyonel olarak kod bloğunu verirsen hatayı çözecek prompt.
---

### Kullanıcıdan alınacak girdiler:

- <input-1> Error Output (Console,DevTools)

- <input-2> İlgili kod bloğu (opsiyonel)


### Prompt:

We have an error.

Constraints:
- Do NOT add new dependencies
- Do NOT refactor unrelated code
- Minimal diff only

Task:

1) Identify root cause from the FIRST error.
2) Propose the smallest fix
3) Provide the corrected code for the affected file only

Here is the build output:
<input-1>

Here is the relevant code snippet:
<input-2>