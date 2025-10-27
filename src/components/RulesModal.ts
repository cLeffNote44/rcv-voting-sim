export function renderRulesModal(onClose: () => void): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay rules-modal-overlay';
  
  const modal = document.createElement('div');
  modal.className = 'modal rules-modal';
  
  // Modal header
  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = `
    <h2>How Ranked Choice Voting Works</h2>
    <button class="modal-close" aria-label="Close">&times;</button>
  `;
  
  // Modal content
  const content = document.createElement('div');
  content.className = 'modal-content rules-content';
  content.innerHTML = `
    <div class="rules-section">
      <h3>🗳️ The Basics</h3>
      <p>
        In Ranked Choice Voting (RCV), also known as Instant Runoff Voting (IRV), 
        voters rank candidates in order of preference (1st choice, 2nd choice, etc.). 
        If no candidate wins a majority in the first round, the election proceeds to 
        instant runoffs until someone wins.
      </p>
    </div>

    <div class="rules-section">
      <h3>📊 How Winners Are Determined</h3>
      <ol>
        <li><strong>Count first choices:</strong> All first-choice votes are counted.</li>
        <li><strong>Check for majority:</strong> If a candidate has more than 50% of active ballots, they win.</li>
        <li><strong>Eliminate lowest:</strong> If no majority, the candidate with the fewest votes is eliminated.</li>
        <li><strong>Redistribute votes:</strong> Ballots for the eliminated candidate go to their next ranked choice.</li>
        <li><strong>Repeat:</strong> Continue until someone has a majority.</li>
      </ol>
    </div>

    <div class="rules-section">
      <h3>🔄 Vote Transfers</h3>
      <p>
        When a candidate is eliminated, their votes transfer to the next valid choice 
        on each ballot. This ensures no vote is "wasted" on candidates who can't win.
      </p>
      <ul>
        <li>If your 1st choice is eliminated, your vote goes to your 2nd choice</li>
        <li>If your 2nd choice is also eliminated, it goes to your 3rd choice</li>
        <li>This continues until a winner is found</li>
      </ul>
    </div>

    <div class="rules-section">
      <h3>❌ Ballot Exhaustion</h3>
      <p>A ballot becomes "exhausted" and stops counting when:</p>
      <ul>
        <li><strong>Overvote:</strong> You ranked multiple candidates at the same rank level</li>
        <li><strong>All eliminated:</strong> All candidates you ranked have been eliminated</li>
        <li><strong>Blank ranks:</strong> You didn't rank enough candidates to have a valid choice remaining</li>
      </ul>
    </div>

    <div class="rules-section">
      <h3>⚖️ Tie Breaking</h3>
      <p>
        If candidates tie for elimination, the tie is broken by looking at who had fewer 
        votes in the previous round. If still tied, it goes back further. In this simulator, 
        persistent ties are broken randomly for demonstration purposes.
      </p>
    </div>

    <div class="rules-section">
      <h3>✅ Benefits of RCV</h3>
      <ul>
        <li>Winners have broader support (majority)</li>
        <li>Reduces strategic voting - vote for who you actually prefer</li>
        <li>Eliminates need for separate runoff elections</li>
        <li>Encourages positive campaigning</li>
        <li>Gives voters more choice and voice</li>
      </ul>
    </div>

    <div class="rules-section rules-note">
      <p>
        <strong>Note:</strong> This simulator uses the Fort Collins RCV rules, which follow 
        standard instant runoff procedures. Different jurisdictions may have slight variations 
        in implementation details.
      </p>
    </div>
  `;
  
  // Close button functionality
  const closeBtn = header.querySelector('.modal-close') as HTMLButtonElement;
  closeBtn.onclick = onClose;
  
  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      onClose();
    }
  };
  
  // Close on Escape key
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
  
  modal.appendChild(header);
  modal.appendChild(content);
  overlay.appendChild(modal);
  
  return overlay;
}
