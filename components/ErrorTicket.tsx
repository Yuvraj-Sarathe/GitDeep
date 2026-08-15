import { memo, useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

import './ErrorTicket.css';

interface ErrorTicketProps {
  open: boolean;
  title: string;
  message: string;
  subject?: string;
  venue?: string;
  gate?: string;
  onClose: () => void;
}

const ErrorTicket = memo<ErrorTicketProps>(({
  open,
  title,
  message,
  subject,
  venue = 'GitDeep Engine',
  gate,
  onClose,
}) => {
  // Deterministic per-message code shown on the ticket (barcode id + stack hex).
  const [code] = useState(() => {
    let h = 0;
    for (let i = 0; i < message.length; i++) h = (h * 31 + message.charCodeAt(i)) >>> 0;
    return h.toString(16).toUpperCase().padStart(4, '0').slice(-4);
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="error-ticket-overlay" onClick={onClose}>
      <div className="ticket-canvas" onClick={e => e.stopPropagation()}>
        <div className="ticket-wrapper">
          <div className="ticket">
            <div className="t-main">
              <div className="t-content">
                <div className="t-header">
                  <div className="t-logo">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    GITDEEP
                  </div>
                  <div className="t-type">Error</div>
                </div>
                <div className="t-title">{title}</div>
                <div className="t-subtitle">{message}</div>
                <div className="t-details">
                  <div className="t-detail-item">
                    <span className="t-label">Name</span><span className="t-value">{subject || 'GitDeep'}</span>
                  </div>
                  <div className="t-detail-item">
                    <span className="t-label">Date</span><span className="t-value">{today}</span>
                  </div>
                  <div className="t-detail-item">
                    <span className="t-label">Venue</span><span className="t-value">{venue}</span>
                  </div>
                  <div className="t-detail-item">
                    <span className="t-label">Gateway</span><span className="t-value">{gate || `Gate 0x${code}`}</span>
                  </div>
                </div>
              </div>
              <div className="t-perforation" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', transform: 'translateY(50%)' }}>
                <div className="t-perf-line" />
              </div>
            </div>
            <div className="t-stub">
              <div className="t-barcode-container">
                <div className="t-barcode" />
                <div className="t-barcode-id">GD-{code}-ERR</div>
              </div>
              <div className="t-admit">
                <div className="t-admit-text">Stack</div>
                <div className="t-admit-num">0x{code}</div>
              </div>
            </div>
          </div>
          <div className="ticket-nav">
            <Link href="/" className="ticket-nav-btn">Home</Link>
            <Link href="/settings" className="ticket-nav-btn">Settings</Link>
            <Link href="/help" className="ticket-nav-btn">Help</Link>
          </div>
        </div>
        <button type="button" className="ticket-close" onClick={onClose} aria-label="Dismiss error">
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});

ErrorTicket.displayName = 'ErrorTicket';

export default ErrorTicket;