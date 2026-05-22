"use client";

type AccountConnectProps = {
  email: string;
  setEmail: (email: string) => void;
  onConnect: () => void | Promise<void>;
  status?: string;
};

export default function AccountConnect({ email, setEmail, onConnect, status }: AccountConnectProps) {
  return (
    <div className="rounded-[26px] border border-white/70 bg-white p-4 shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <label className="grid gap-2">
          <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">Account Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="portal-field"
          />
        </label>
        <button type="button" onClick={onConnect} className="portal-action self-end">
          Connect Account
        </button>
      </div>
      {status && <p className="mt-3 rounded-[16px] bg-[#f5f7fb] px-4 py-3 text-sm font-semibold text-[#6b7280]">{status}</p>}
    </div>
  );
}
