export function showModal(opts: { title: string; message: string | string[]; confirmText?: string; cancelText?: string }): Promise<boolean> {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    const modal = document.createElement('div');
    modal.className = 'modal';

    const h = document.createElement('h2');
    h.textContent = opts.title;

    const content = document.createElement('div');
    if (Array.isArray(opts.message)) {
      const ul = document.createElement('ul');
      ul.className = 'msg-list';
      for (const m of opts.message) {
        const li = document.createElement('li');
        li.textContent = m;
        ul.appendChild(li);
      }
      content.appendChild(ul);
    } else {
      const p = document.createElement('p');
      p.textContent = opts.message;
      content.appendChild(p);
    }

    const btns = document.createElement('div');
    btns.className = 'modal-buttons';
    const cancel = document.createElement('button');
    cancel.textContent = opts.cancelText || 'Back';
    const ok = document.createElement('button');
    ok.textContent = opts.confirmText || 'Proceed';
    ok.className = 'primary';

    btns.append(cancel, ok);
    modal.append(h, content, btns);
    overlay.append(modal);
    document.body.appendChild(overlay);

    const cleanup = (val: boolean) => {
      document.body.removeChild(overlay);
      resolve(val);
    };
    cancel.addEventListener('click', () => cleanup(false));
    ok.addEventListener('click', () => cleanup(true));
    overlay.addEventListener('keydown', e => {
      if ((e as KeyboardEvent).key === 'Escape') cleanup(false);
    });
    ok.focus();
  });
}

