/**
 * Loading spinner overlay for long-running operations
 */

export function showLoadingSpinner(message = 'Processing...'): () => void {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';

  const spinner = document.createElement('div');
  spinner.className = 'spinner';

  const text = document.createElement('div');
  text.className = 'loading-text';
  text.textContent = message;

  overlay.append(spinner, text);
  document.body.appendChild(overlay);

  // Return function to hide the spinner
  return () => {
    overlay.style.animation = 'fadeIn 0.2s ease-out reverse';
    setTimeout(() => {
      if (overlay.parentNode) {
        document.body.removeChild(overlay);
      }
    }, 200);
  };
}
