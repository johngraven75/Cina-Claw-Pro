import { useEffect, useState } from 'react';
import { Copy, RefreshCw, ShieldCheck, Smartphone, Unplug } from 'lucide-react';
import { toast } from 'sonner';
import { hostApi } from '@/lib/host-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type RelayStatus = Awaited<ReturnType<typeof hostApi.remoteRelay.status>>;
type RelayDevice = Awaited<ReturnType<typeof hostApi.remoteRelay.listDevices>>[number];

export function RemoteRelaySettings() {
  const [status, setStatus] = useState<RelayStatus | null>(null);
  const [relayUrl, setRelayUrl] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [devices, setDevices] = useState<RelayDevice[]>([]);
  const [pairingCode, setPairingCode] = useState<{ code: string; expiresAt: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const [nextStatus, nextDevices] = await Promise.all([hostApi.remoteRelay.status(), hostApi.remoteRelay.listDevices().catch(() => [])]);
      setStatus(nextStatus);
      setRelayUrl(nextStatus.relayUrl);
      setEnabled(nextStatus.enabled);
      setDevices(nextDevices);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load remote relay settings.');
    }
  };

  useEffect(() => { void load(); }, []);

  const save = async () => {
    setBusy(true);
    try {
      const next = await hostApi.remoteRelay.configure({ relayUrl, enabled });
      setStatus(next);
      setRelayUrl(next.relayUrl);
      toast.success(next.enabled ? 'Free remote relay enabled.' : 'Remote relay disabled.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save remote relay settings.');
    } finally {
      setBusy(false);
    }
  };

  const createPairingCode = async () => {
    setBusy(true);
    try {
      const code = await hostApi.remoteRelay.createPairingCode();
      setPairingCode(code);
      await load();
      toast.success('One-time Android pairing code created.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create pairing code.');
    } finally {
      setBusy(false);
    }
  };

  const copyPairing = async () => {
    if (!pairingCode) return;
    await navigator.clipboard.writeText(pairingCode.code);
    toast.success('Pairing code copied.');
  };

  const revoke = async (device: RelayDevice) => {
    setBusy(true);
    try {
      await hostApi.remoteRelay.revokeDevice({ deviceId: device.id });
      await load();
      toast.success(`${device.name} was revoked.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to revoke device.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5" data-testid="settings-remote-relay-section">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-serif text-foreground font-normal tracking-tight">Remote Android relay</h2>
        <p className="text-meta text-muted-foreground">Free queued delivery. The desktop makes short outbound HTTPS checks while CinaClaw Pro is open; it never exposes an inbound port.</p>
      </div>
      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-cyan-500" /><div><Label>Enable remote task delivery</Label><p className="text-meta text-muted-foreground mt-1">Tasks wait securely until this desktop gateway checks in.</p></div></div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
        <div className="space-y-2"><Label htmlFor="remote-relay-url">Relay URL</Label><Input id="remote-relay-url" value={relayUrl} onChange={(event) => setRelayUrl(event.target.value)} placeholder="https://your-cinaclaw-relay.example" autoComplete="off" /></div>
        <div className="flex flex-wrap items-center gap-3"><Button onClick={() => void save()} disabled={busy}>{busy ? 'Saving…' : 'Save relay'}</Button><Button variant="outline" onClick={() => void load()} disabled={busy}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>{status?.gatewayId && <span className="text-meta text-muted-foreground">Gateway ID: <code>{status.gatewayId}</code></span>}</div>
        {status?.lastError && <p className="text-meta text-amber-600 dark:text-amber-400">Last relay check: {status.lastError}</p>}
      </div>
      {enabled && status?.gatewayId && <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-3"><div className="flex items-center gap-3"><Smartphone className="h-5 w-5 text-violet-500" /><div><Label>Pair Android</Label><p className="text-meta text-muted-foreground mt-1">Create a code, then enter this gateway ID and code in CinaClaw Pro Android.</p></div></div><div className="flex flex-wrap gap-3"><Button onClick={() => void createPairingCode()} disabled={busy}>Create one-time code</Button>{pairingCode && <Button variant="outline" onClick={() => void copyPairing()}><Copy className="h-4 w-4 mr-2" />{pairingCode.code}</Button>}</div>{pairingCode && <p className="text-meta text-muted-foreground">Expires {new Date(pairingCode.expiresAt).toLocaleTimeString()}.</p>}</div>}
      {devices.length > 0 && <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5 space-y-3"><Label>Paired Android devices</Label>{devices.map((device) => <div key={device.id} className="flex items-center justify-between gap-3 text-sm"><div><p className="font-medium text-foreground">{device.name}</p><p className="text-meta text-muted-foreground">{device.status} · last seen {new Date(device.lastSeenAt).toLocaleString()}</p></div>{device.status === 'active' && <Button variant="outline" size="sm" onClick={() => void revoke(device)} disabled={busy}><Unplug className="h-3.5 w-3.5 mr-1.5" />Revoke</Button>}</div>)}</div>}
    </div>
  );
}
