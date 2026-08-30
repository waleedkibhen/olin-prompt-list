import React, { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { Zap, X, Loader2, Check } from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface MembershipPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriberPostCount: number;
}

export default function MembershipPlanModal({
  isOpen,
  onClose,
  subscriberPostCount
}: MembershipPlanModalProps) {
  const { user, profile, updateProfileState } = useAuth();
  const plan = (profile as any)?.subscriptionPlan;
  const legacy = (profile as any)?.subscriptionSettings;

  const [subEnabled, setSubEnabled] = useState<boolean>(plan?.enabled ?? legacy?.enabled ?? false);
  const [enableMonthly, setEnableMonthly] = useState<boolean>(
    plan?.enableMonthly != null
      ? plan.enableMonthly
      : (plan?.monthlyPrice != null && plan.monthlyPrice > 0)
        ? true
        : false
  );
  const [enableYearly, setEnableYearly] = useState<boolean>(
    plan?.enableYearly != null
      ? plan.enableYearly
      : (plan?.yearlyPrice != null && plan.yearlyPrice > 0)
        ? true
        : false
  );
  const [subMonthlyPrice, setSubMonthlyPrice] = useState<string>(
    plan?.monthlyPrice != null && plan.monthlyPrice > 0 ? String(plan.monthlyPrice) : '4.99'
  );
  const [subYearlyPrice, setSubYearlyPrice] = useState<string>(
    plan?.yearlyPrice != null && plan.yearlyPrice > 0 ? String(plan.yearlyPrice) : '49.99'
  );
  const [subBenefits, setSubBenefits] = useState<string>(
    plan?.benefits?.join('\n') ?? legacy?.description ?? 'Access to all exclusive subscriber only prompts\nFull prompt license & parameter breakdowns\nEarly access to new prompt drops'
  );
  const [isSavingSub, setIsSavingSub] = useState(false);

  useEffect(() => {
    if (plan) {
      setSubEnabled(plan.enabled ?? false);
      const hasMonthly = plan.enableMonthly != null ? plan.enableMonthly : (plan.monthlyPrice != null && plan.monthlyPrice > 0);
      const hasYearly = plan.enableYearly != null ? plan.enableYearly : (plan.yearlyPrice != null && plan.yearlyPrice > 0);
      setEnableMonthly(Boolean(hasMonthly));
      setEnableYearly(Boolean(hasYearly));
      setSubMonthlyPrice(plan.monthlyPrice != null && plan.monthlyPrice > 0 ? String(plan.monthlyPrice) : '4.99');
      setSubYearlyPrice(plan.yearlyPrice != null && plan.yearlyPrice > 0 ? String(plan.yearlyPrice) : '49.99');
      if (plan.benefits && plan.benefits.length > 0) {
        setSubBenefits(plan.benefits.join('\n'));
      }
    } else {
      setSubEnabled(false);
      setEnableMonthly(false);
      setEnableYearly(false);
    }
  }, [profile?.uid, JSON.stringify(plan ?? null), isOpen]);

  if (!isOpen) return null;

  const monthlyPriceNum = parseFloat(subMonthlyPrice) || 0;
  const yearlyPriceNum = parseFloat(subYearlyPrice) || 0;
  const savingsPct = enableMonthly && enableYearly && monthlyPriceNum > 0 && yearlyPriceNum > 0 && yearlyPriceNum < monthlyPriceNum * 12
    ? Math.round((1 - yearlyPriceNum / (monthlyPriceNum * 12)) * 100)
    : null;

  const handleSaveSubscription = async () => {
    if (!user) return;

    if (subEnabled) {
      if (!enableMonthly && !enableYearly) {
        toast.error('Please enable at least one billing tier (Monthly or Yearly).');
        return;
      }
      if (enableMonthly && monthlyPriceNum <= 0) {
        toast.error('Please set a valid monthly price greater than $0.');
        return;
      }
      if (enableYearly && yearlyPriceNum <= 0) {
        toast.error('Please set a valid yearly price greater than $0.');
        return;
      }
    }

    setIsSavingSub(true);
    try {
      let provData: any = { whopMonthlyPlanId: '', whopYearlyPlanId: '' };

      if (subEnabled) {
        // Whop auto-provisions the active renewal plans for this creator
        const provRes = await fetch('/api/whop/provision-membership', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            monthlyPrice: enableMonthly ? monthlyPriceNum : 0,
            yearlyPrice: enableYearly ? yearlyPriceNum : 0,
            creatorName: profile?.displayName || profile?.username || 'Olin Creator'
          })
        });
        provData = await provRes.json();
        if (!provRes.ok || !provData.success) {
          if (provData.code === 'products_permission_missing') {
            throw new Error('Whop key needs the products permission: Whop Dashboard → Developer → API keys → enable Products, then save again.');
          }
          throw new Error(provData.error || 'Failed to provision Whop membership plans');
        }
      }

      const settings = {
        enabled: subEnabled,
        enableMonthly: subEnabled ? enableMonthly : false,
        enableYearly: subEnabled ? enableYearly : false,
        monthlyPrice: subEnabled && enableMonthly ? monthlyPriceNum : 0,
        yearlyPrice: subEnabled && enableYearly ? yearlyPriceNum : 0,
        benefits: subBenefits.split('\n').map(b => b.trim()).filter(Boolean),
        whopMonthlyPlanId: subEnabled && enableMonthly ? (provData.whopMonthlyPlanId || plan?.whopMonthlyPlanId || '') : '',
        whopYearlyPlanId: subEnabled && enableYearly ? (provData.whopYearlyPlanId || plan?.whopYearlyPlanId || '') : ''
      };

      await updateDoc(doc(db, 'users', user.uid), { subscriptionPlan: settings });
      await updateProfileState({ subscriptionPlan: settings } as any);
      toast.success(subEnabled ? 'Creator Membership plan saved & active!' : 'Membership plan saved (disabled).');
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setIsSavingSub(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        padding: '1rem',
        backdropFilter: 'blur(6px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#111111',
          border: '1px solid #27272a',
          borderRadius: '16px',
          padding: '1.75rem',
          position: 'relative',
          color: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            color: '#a1a1aa',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Title without SVG */}
        <div style={{ marginBottom: '0.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
            Creator Membership Plan
          </h2>
        </div>
        <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#a1a1aa', lineHeight: 1.5 }}>
          Allow your audience to subscribe to you for recurring monthly or yearly access to all your subscriber only prompts.
        </p>

        {/* Auto-counted subscriber prompts badge without hyphen */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '8px',
            padding: '0.5rem 0.85rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            color: '#e4e4e7'
          }}
        >
          <Zap size={14} style={{ color: '#a855f7', flexShrink: 0 }} />
          <span>Membership currently includes <strong>{subscriberPostCount}</strong> subscriber only prompt{subscriberPostCount === 1 ? '' : 's'}</span>
        </div>

        {/* Master Subscriptions Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.9rem 1.1rem',
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '12px',
            marginBottom: '1.25rem'
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Enable Subscriptions</div>
            <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Make your membership active for viewers to purchase</div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={subEnabled}
              onChange={(e) => setSubEnabled(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: subEnabled ? '#9333ea' : '#3f3f46',
                borderRadius: '24px',
                transition: '0.2s ease',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: subEnabled ? '22px' : '2px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  transition: '0.2s ease'
                }}
              />
            </span>
          </label>
        </div>

        {/* Pricing Tiers (Visible when Enabled) */}
        {subEnabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Monthly Tier Card - Always Gray Background & Border */}
            <div
              style={{
                padding: '1rem 1.1rem',
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: enableMonthly ? '0.75rem' : 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.92rem' }}>
                  <input
                    type="checkbox"
                    checked={enableMonthly}
                    onChange={(e) => setEnableMonthly(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#9333ea', cursor: 'pointer' }}
                  />
                  <span>Monthly Subscription</span>
                </label>
                <span style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>Billed every 30 days</span>
              </div>

              {enableMonthly && (
                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#a1a1aa', display: 'block', marginBottom: '0.35rem' }}>Monthly Price (USD)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa', fontWeight: 600 }}>$</span>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={subMonthlyPrice}
                      onChange={(e) => setSubMonthlyPrice(e.target.value)}
                      placeholder="4.99"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem 0.65rem 1.8rem',
                        borderRadius: '8px',
                        border: '1px solid #27272a',
                        background: '#0a0a0c',
                        color: '#ffffff',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Yearly Tier Card - Always Gray Background & Border */}
            <div
              style={{
                padding: '1rem 1.1rem',
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: enableYearly ? '0.75rem' : 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.92rem' }}>
                  <input
                    type="checkbox"
                    checked={enableYearly}
                    onChange={(e) => setEnableYearly(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#9333ea', cursor: 'pointer' }}
                  />
                  <span>Yearly Subscription</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {savingsPct != null && savingsPct > 0 && enableYearly && (
                    <span
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.18)',
                        border: '1px solid rgba(16, 185, 129, 0.45)',
                        borderRadius: '9999px',
                        padding: '0.15rem 0.55rem',
                        fontSize: '0.72rem',
                        color: '#ffffff',
                        fontWeight: 700
                      }}
                    >
                      Save {savingsPct}% vs monthly
                    </span>
                  )}
                  <span style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>Billed every 365 days</span>
                </div>
              </div>

              {enableYearly && (
                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#a1a1aa', display: 'block', marginBottom: '0.35rem' }}>Yearly Price (USD)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa', fontWeight: 600 }}>$</span>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={subYearlyPrice}
                      onChange={(e) => setSubYearlyPrice(e.target.value)}
                      placeholder="49.99"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem 0.65rem 1.8rem',
                        borderRadius: '8px',
                        border: '1px solid #27272a',
                        background: '#0a0a0c',
                        color: '#ffffff',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Member Benefits */}
            <div>
              <label style={{ fontSize: '0.82rem', color: '#a1a1aa', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                Member Benefits (one perk per line)
              </label>
              <textarea
                value={subBenefits}
                onChange={(e) => setSubBenefits(e.target.value)}
                rows={3}
                placeholder="Access to all subscriber only prompts&#10;Full prompt parameters & licenses&#10;Early access to drops"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #27272a',
                  background: '#0a0a0c',
                  color: '#ffffff',
                  resize: 'vertical',
                  fontSize: '0.88rem',
                  lineHeight: 1.5
                }}
              />
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid #27272a',
              background: 'transparent',
              color: '#a1a1aa',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem'
            }}
            disabled={isSavingSub}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-solid"
            onClick={handleSaveSubscription}
            disabled={isSavingSub}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.35rem',
              backgroundColor: '#9333ea',
              borderColor: '#9333ea',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            {isSavingSub ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
            {isSavingSub ? 'Saving...' : 'Save Membership Plan'}
          </button>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.85rem', textAlign: 'center' }}>
          Whop renewal plans are provisioned automatically when you save. Subscribers unlock all your Subscriber Only prompts while their membership is active.
        </div>
      </div>
    </div>
  );
}