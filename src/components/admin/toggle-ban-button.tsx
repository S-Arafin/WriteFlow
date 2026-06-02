'use client';

import { ShieldAlert, UserCheck } from 'lucide-react';
import React from 'react';

interface ToggleBanButtonProps {
  userId: string;
  isBanned: boolean;
  onToggleBan: (formData: FormData) => Promise<void>;
}

export function ToggleBanButton({
  userId,
  isBanned,
  onToggleBan,
}: ToggleBanButtonProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (
      !confirm(
        `Are you absolutely sure you want to ${isBanned ? 'UNBAN' : 'BAN'} this user's account?`
      )
    ) {
      e.preventDefault();
    }
  };

  return (
    <form action={onToggleBan} className="inline-flex" onSubmit={handleSubmit}>
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
          isBanned
            ? 'border-emerald-950/30 bg-emerald-950/10 text-emerald-400 hover:bg-emerald-950/30'
            : 'border-red-950/30 bg-red-950/10 text-red-400 hover:bg-red-950/30'
        }`}
      >
        {isBanned ? (
          <UserCheck className="h-3.5 w-3.5" />
        ) : (
          <ShieldAlert className="h-3.5 w-3.5" />
        )}
        <span>{isBanned ? 'Unban' : 'Ban'}</span>
      </button>
    </form>
  );
}
