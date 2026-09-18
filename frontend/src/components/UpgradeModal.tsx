import React, { useEffect } from 'react';
import { Lock, Crown, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'jobseeker' | 'hr';
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, userType }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const title = userType === 'jobseeker' ? "You've used all free analyses" : "You've used all free evaluations";
  const freeItem = userType === 'jobseeker' ? "2 analyses" : "2 evaluations";
  const extraFeature = userType === 'jobseeker' ? "Resume tailoring tips" : "Bulk candidate ranking";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="glass-md rounded-2xl w-full max-w-lg overflow-hidden animate-slide-up-modal relative" onClick={e => e.stopPropagation()}>
        <div className="p-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full gradient-border flex items-center justify-center bg-gray-900 mb-6 relative">
            <div className="absolute inset-0 bg-mesh-subtle rounded-full opacity-50"></div>
            {userType === 'hr' ? (
              <Crown className="w-8 h-8 text-amber-500 relative z-10" />
            ) : (
              <Lock className="w-8 h-8 text-violet-500 relative z-10" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2 text-center">{title}</h2>
          <p className="text-muted text-center mb-8">
            Create a free account to unlock unlimited access and advanced features.
          </p>

          <div className="w-full grid grid-cols-2 gap-4 mb-8">
            {/* Free Column */}
            <div className="glass rounded-xl p-4 flex flex-col gap-3">
              <h3 className="text-secondary font-semibold border-b border-white/10 pb-2 mb-1">Free Demo</h3>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{freeItem}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Basic results</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <X className="w-4 h-4 text-rose-500 shrink-0" />
                <span>No history</span>
              </div>
            </div>

            {/* Pro Column */}
            <div className="glass-md rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 blur-xl rounded-full"></div>
              <h3 className="gradient-text font-semibold border-b border-white/10 pb-2 mb-1">Registered</h3>
              <div className="flex items-center gap-2 text-sm text-white">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Unlimited</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Detailed breakdowns</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Full history</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{extraFeature}</span>
              </div>
            </div>
          </div>

          <div className="w-full space-y-3">
            <Link to="/register" className="btn-primary w-full block text-center py-3">
              Create Free Account
            </Link>
            <button onClick={onClose} className="btn-ghost w-full py-3 text-secondary hover:text-white transition-colors">
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
