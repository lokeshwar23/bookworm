'use client';
// components/forms/MockPaymentModal.jsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard, Smartphone, Wallet, Banknote,
  X, CheckCircle2, ShieldCheck,
} from 'lucide-react';

const METHODS = [
  { id: 'card',   label: 'Card',     Icon: CreditCard },
  { id: 'upi',    label: 'UPI',      Icon: Smartphone },
  { id: 'wallet', label: 'Wallet',   Icon: Wallet     },
  { id: 'cod',    label: 'Cash / COD', Icon: Banknote },
];

/** Format raw digits → XXXX XXXX XXXX XXXX */
function fmtCard(raw) {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
/** Format raw digits → MM/YYYY */
function fmtExpiry(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 6);
  return d.length <= 2 ? d : d.slice(0, 2) + '/' + d.slice(2);
}

export default function MockPaymentModal({ orderId, total, onClose }) {
  const router = useRouter();

  const [method, setMethod] = useState('card');
  const [paying, setPaying] = useState(false);
  const [done,   setDone]   = useState(false);
  const [apiErr, setApiErr] = useState('');
  const [errs,   setErrs]   = useState({});

  // card fields
  const [cardNum,  setCardNum]  = useState('');
  const [cardName, setCardName] = useState('');
  const [cvv,      setCvv]      = useState('');
  const [expiry,   setExpiry]   = useState('');
  // upi
  const [upiId,    setUpiId]    = useState('');
  // wallet
  const [walletId, setWalletId] = useState('');

  const isCOD = method === 'cod';

  function clearErr(key) {
    setErrs(p => { const n = { ...p }; delete n[key]; return n; });
  }

  function switchMethod(id) {
    setMethod(id);
    setErrs({});
    setApiErr('');
  }

  function validate() {
    const e = {};
    if (method === 'card') {
      const digits = cardNum.replace(/\s/g, '');
      if (!digits)           e.cardNum  = 'Card number is required.';
      else if (digits.length !== 16) e.cardNum = 'Card number must be 16 digits.';
      if (!cardName.trim())  e.cardName = 'Name on card is required.';
      if (!cvv)              e.cvv      = 'CVV is required.';
      else if (!/^\d{3,4}$/.test(cvv)) e.cvv = 'CVV must be 3 or 4 digits.';
      if (!expiry)           e.expiry   = 'Expiry date is required.';
      else {
        const m = expiry.match(/^(\d{2})\/(\d{4})$/);
        if (!m) {
          e.expiry = 'Use MM/YYYY format.';
        } else {
          const mon = parseInt(m[1], 10), yr = parseInt(m[2], 10);
          const now = new Date();
          if (mon < 1 || mon > 12) e.expiry = 'Month must be 01–12.';
          else if (yr < now.getFullYear() || (yr === now.getFullYear() && mon < now.getMonth() + 1))
            e.expiry = 'Card has expired.';
        }
      }
    }
    if (method === 'upi') {
      const id = upiId.trim();
      if (!id) { e.upiId = 'UPI ID is required.'; }
      else {
        const parts = id.split('@');
        if (parts.length !== 2 || !parts[0] || !parts[1])
          e.upiId = 'UPI ID must contain @ — e.g. yourname@bankname';
      }
    }
    if (method === 'wallet') {
      if (!walletId.trim()) e.walletId = 'Wallet ID / phone number is required.';
    }
    return e;
  }

  async function handlePay() {
    setApiErr('');
    if (!isCOD) {
      const e = validate();
      if (Object.keys(e).length) { setErrs(e); return; }
    }

    setPaying(true);
    try {
      // Simulate a brief network delay
      await new Promise(r => setTimeout(r, 1000));

      const res = await fetch('/api/checkout/verify-payment', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiErr(data.error || 'Something went wrong.');
        setPaying(false);
        return;
      }

      // Show success tick briefly, then redirect
      setDone(true);
      await new Promise(r => setTimeout(r, 1200));
      router.push(`/orders/${orderId}`);
    } catch {
      setApiErr('Payment failed. Please try again.');
      setPaying(false);
    }
  }

  // ── Success overlay ────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-4 animate-fade-in">
          <CheckCircle2 size={56} className="text-green-400" />
          <h2 className="text-white text-xl font-bold">Payment Successful!</h2>
          <p className="text-gray-400 text-sm">Redirecting to your order…</p>
        </div>
      </div>
    );
  }

  // helper: input class
  const inp = (key) =>
    `w-full px-3 py-2 rounded-lg bg-[#111] border text-sm text-gray-200 focus:outline-none transition ${
      errs[key] ? 'border-red-600 focus:border-red-500' : 'border-[#2a2a2a] focus:border-indigo-500'
    }`;

  // ── Main modal ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-lg bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
          <div>
            <h2 className="text-white font-semibold flex items-center gap-2">
              <ShieldCheck size={16} className="text-indigo-400" /> Complete Payment
            </h2>
            <p className="text-indigo-400 text-sm font-bold mt-0.5">
              Payable: ₹{parseFloat(total).toFixed(0)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        <div className="flex min-h-[280px]">
          {/* ── Method sidebar ── */}
          <div className="w-36 border-r border-[#2a2a2a] py-2 flex-shrink-0 flex flex-col">
            {METHODS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => switchMethod(id)}
                className={`w-full flex items-center gap-2 px-4 py-3 text-sm transition text-left ${
                  method === id
                    ? 'bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={15} className="flex-shrink-0" />
                <span className="leading-tight">{label}</span>
              </button>
            ))}
          </div>

          {/* ── Right panel ── */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[75vh]">

            {apiErr && (
              <p className="px-3 py-2 rounded-lg bg-red-900/30 border border-red-700 text-red-300 text-sm">{apiErr}</p>
            )}

            {/* ── CARD fields ── */}
            {method === 'card' && (
              <div className="space-y-3">
                {/* Card number */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Card Number <span className="text-red-400">*</span></label>
                  <input
                    value={cardNum}
                    onChange={e => { setCardNum(fmtCard(e.target.value)); clearErr('cardNum'); }}
                    placeholder="XXXX XXXX XXXX XXXX"
                    inputMode="numeric"
                    maxLength={19}
                    className={inp('cardNum')}
                  />
                  {errs.cardNum && <p className="mt-1 text-xs text-red-400">{errs.cardNum}</p>}
                </div>
                {/* Name on card */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Name on Card <span className="text-red-400">*</span></label>
                  <input
                    value={cardName}
                    onChange={e => { setCardName(e.target.value); clearErr('cardName'); }}
                    placeholder="As printed on card"
                    className={inp('cardName')}
                  />
                  {errs.cardName && <p className="mt-1 text-xs text-red-400">{errs.cardName}</p>}
                </div>
                {/* CVV + Expiry side by side */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 mb-1">CVV <span className="text-red-400">*</span></label>
                    <input
                      value={cvv}
                      onChange={e => { setCvv(e.target.value.replace(/\D/g, '').slice(0, 4)); clearErr('cvv'); }}
                      placeholder="XXX"
                      inputMode="numeric"
                      maxLength={4}
                      className={inp('cvv')}
                    />
                    {errs.cvv && <p className="mt-1 text-xs text-red-400">{errs.cvv}</p>}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 mb-1">Expiry (MM/YYYY) <span className="text-red-400">*</span></label>
                    <input
                      value={expiry}
                      onChange={e => { setExpiry(fmtExpiry(e.target.value)); clearErr('expiry'); }}
                      placeholder="MM/YYYY"
                      inputMode="numeric"
                      maxLength={7}
                      className={inp('expiry')}
                    />
                    {errs.expiry && <p className="mt-1 text-xs text-red-400">{errs.expiry}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ── UPI fields ── */}
            {method === 'upi' && (
              <div>
                <label className="block text-xs text-gray-400 mb-1">UPI ID <span className="text-red-400">*</span></label>
                <input
                  value={upiId}
                  onChange={e => { setUpiId(e.target.value); clearErr('upiId'); }}
                  placeholder="yourname@bankname"
                  className={inp('upiId')}
                />
                {errs.upiId
                  ? <p className="mt-1 text-xs text-red-400">{errs.upiId}</p>
                  : <p className="mt-1 text-xs text-gray-500">e.g. yourname@okaxis, yourname@ybl</p>
                }
              </div>
            )}

            {/* ── Wallet fields ── */}
            {method === 'wallet' && (
              <div>
                <label className="block text-xs text-gray-400 mb-1">Registered Mobile Number <span className="text-red-400">*</span></label>
                <input
                  value={walletId}
                  onChange={e => { setWalletId(e.target.value); clearErr('walletId'); }}
                  placeholder="9876543210"
                  inputMode="tel"
                  className={inp('walletId')}
                />
                {errs.walletId
                  ? <p className="mt-1 text-xs text-red-400">{errs.walletId}</p>
                  : <p className="mt-1 text-xs text-gray-500">Enter the mobile number linked to your wallet</p>
                }
              </div>
            )}

            {/* ── COD ── */}
            {isCOD && (
              <div className="flex flex-col items-center text-center py-4 gap-5">
                {/* Icon + amount */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-indigo-500/15 flex items-center justify-center">
                    <Banknote size={28} className="text-indigo-400" />
                  </div>
                  <p className="text-white font-semibold text-base">Cash on Delivery</p>
                  <p className="text-indigo-400 font-bold text-3xl">₹{parseFloat(total).toFixed(0)}</p>
                  <p className="text-gray-500 text-xs">Payable at the time of delivery</p>
                </div>

                {/* Divider */}
                <div className="w-full border-t border-[#2a2a2a]" />
              </div>
            )}

            {/* ── Pay button ── */}
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full py-3 font-semibold rounded-xl transition flex items-center justify-center gap-2 text-white disabled:opacity-60 bg-indigo-600 hover:bg-indigo-500"
            >
              {paying ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                  Processing…
                </>
              ) : isCOD ? (
                <><Banknote size={16} /> Confirm Order — Pay on Delivery</>
              ) : (
                <><ShieldCheck size={16} /> Pay ₹{parseFloat(total).toFixed(0)}</>
              )}
            </button>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#2a2a2a] flex items-center justify-center gap-2 text-gray-600 text-xs">
          <ShieldCheck size={12} />
          256-bit SSL encrypted &amp; secure payment
        </div>

      </div>
    </div>
  );
}
