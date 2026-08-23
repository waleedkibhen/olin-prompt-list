const fs = require('fs');

let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const missingEnd = `</>
      )}

      {postToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Delete Artwork</h3>
            <p className={styles.modalText}>
              Are you sure you want to permanently delete "{postToDelete.title}"? This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setPostToDelete(null)}>Cancel</button>
              <button className={styles.modalDeleteBtn} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(/<\/main>/, missingEnd + '      </main>');
fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log('Fixed missing end tags');
