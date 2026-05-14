'use client';

import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function LogoutConfirmation({ onConfirm, onCancel }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <h2 className={styles.modalTitle}>Sign out?</h2>
        <p className={styles.modalMessage}>
          You will be signed out and need to sign in again to access the dashboard.
        </p>
        <div className={styles.modalActions}>
          <button type="button" className={styles.secondaryButton} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={styles.dangerButton} onClick={onConfirm}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
