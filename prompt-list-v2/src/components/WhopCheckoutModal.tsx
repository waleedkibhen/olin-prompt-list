import React, { useEffect } from 'react';
import { WhopCheckoutEmbed } from "@whop/checkout/react";
import { X } from 'lucide-react';

interface WhopCheckoutModalProps {
  planId: string;
  onSuccess: () => void;
  onClose: () => void;
  metadata?: Record<string, string>;
}

export default function WhopCheckoutModal({ planId, onSuccess, onClose, metadata }: WhopCheckoutModalProps) {
  useEffect(() => {
    // Disable background scrolling when active
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '500px',
          height: '80vh',
          maxHeight: '700px',
          backgroundColor: 'var(--bg-primary, #000)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid var(--border-color, #333)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <X size={20} />
        </button>

        <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
          <WhopCheckoutEmbed 
            planId={planId} 
            theme="dark"
            returnUrl={window.location.href}
            {...(metadata ? ({ metadata } as any) : {})}
            onComplete={() => {
              onSuccess();
            }}
          />
        </div>
      </div>
    </div>
  );
}
