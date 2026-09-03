// Web implementation of the file seam — a hidden <input type="file"> to read a CSV and a
// synthetic <a download> to save one. Kept in a `.web` sibling so the native build never
// sees the DOM. See `csvFile.ts` for the native half.

/**
 * Opens the browser's file picker and resolves with the file's text, or `null` if the
 * user cancelled. Cancellation has no reliable event, so the input is left attached and
 * cleaned up on the next `focus` — either way exactly one of the two paths resolves.
 */
export async function pickCsvText(): Promise<string | null> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,text/csv';
    input.style.display = 'none';

    let settled = false;
    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(value);
    };

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) {
        finish(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => finish(String(reader.result ?? ''));
      reader.onerror = () => finish(null);
      reader.readAsText(file);
    });

    // Cancelling a file dialog fires no event of its own; regaining window focus is the
    // only signal. Reading the file is async, so this must not resolve out from under a
    // pending FileReader — hence the check that nothing was actually chosen.
    window.addEventListener(
      'focus',
      () => {
        setTimeout(() => {
          if (!input.files?.length) finish(null);
        }, 300);
      },
      { once: true }
    );

    document.body.appendChild(input);
    input.click();
  });
}

/** Saves `content` to the user's downloads as `filename`. */
export async function saveCsvFile(filename: string, content: string): Promise<void> {
  const url = URL.createObjectURL(
    new Blob([content], { type: 'text/csv;charset=utf-8;' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
