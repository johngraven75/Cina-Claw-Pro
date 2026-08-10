import { useState } from 'react';
import { Mic2, Sparkles, UserRound, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { VOICE_PROFILES, getVoiceProfile } from '@shared/voice';
import { hostApi } from '@/lib/host-api';
import { useSettingsStore } from '@/stores/settings';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export function VoiceSettings() {
  const { t } = useTranslation('settings');
  const {
    voiceEnabled,
    voiceProfileId,
    voiceAutoRead,
    voiceAutoSend,
    voiceSpeed,
    voiceDepth,
    setVoiceEnabled,
    setVoiceProfileId,
    setVoiceAutoRead,
    setVoiceAutoSend,
    setVoiceSpeed,
    setVoiceDepth,
  } = useSettingsStore();
  const [testing, setTesting] = useState(false);
  const selectedProfile = getVoiceProfile(voiceProfileId);

  const testVoice = async () => {
    setTesting(true);
    try {
      const result = await hostApi.voice.speak({
        text: t('voice.testPhrase'),
        profileId: selectedProfile.id,
        speed: voiceSpeed,
        depth: voiceDepth,
      });
      if (!result.success && result.error) toast.error(result.error);
    } catch (error) {
      toast.error(String(error));
    } finally {
      setTesting(false);
    }
  };

  return (
    <section data-testid="voice-settings" aria-labelledby="voice-settings-title">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
              <Mic2 className="h-5 w-5" />
            </span>
            <div>
              <h2 id="voice-settings-title" className="text-3xl font-serif font-normal tracking-tight text-foreground">
                {t('voice.title')}
              </h2>
              <p className="mt-1 text-meta text-muted-foreground">{t('voice.description')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-black/10 bg-black/[0.02] px-4 py-2 dark:border-white/10 dark:bg-white/[0.04]">
          <Label htmlFor="voice-enabled" className="text-sm font-medium">{t('voice.enabled')}</Label>
          <Switch id="voice-enabled" checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
        </div>
      </div>

      <div className={cn('space-y-7 transition-opacity', !voiceEnabled && 'pointer-events-none opacity-45')}>
        <div>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <Label className="text-sm font-medium text-foreground">{t('voice.choose')}</Label>
              <p className="mt-1 text-meta text-muted-foreground">{t('voice.balance')}</p>
            </div>
            <span className="rounded-full bg-black/5 px-3 py-1 text-tiny font-semibold uppercase tracking-[0.12em] text-muted-foreground dark:bg-white/10">
              {t('voice.count')}
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5" data-testid="voice-profile-grid">
            {VOICE_PROFILES.map((profile) => {
              const selected = profile.id === selectedProfile.id;
              return (
                <button
                  key={profile.id}
                  type="button"
                  data-testid={`voice-profile-${profile.id}`}
                  aria-pressed={selected}
                  onClick={() => setVoiceProfileId(profile.id)}
                  className={cn(
                    'group relative overflow-hidden rounded-2xl border p-3 text-left transition duration-200',
                    selected
                      ? 'border-cyan-500/40 bg-cyan-500/10 shadow-[0_12px_35px_rgba(6,182,212,0.12)]'
                      : 'border-black/10 bg-surface-modal hover:-translate-y-0.5 hover:border-cyan-500/25 dark:border-white/10',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-xl',
                      profile.gender === 'female'
                        ? 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300'
                        : 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
                    )}>
                      <UserRound className="h-4 w-4" />
                    </span>
                    {selected && <Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-300" />}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">{t(`voice.profiles.${profile.id}.name`)}</p>
                  <p className="mt-0.5 text-tiny text-muted-foreground">
                    {t(`voice.genders.${profile.gender}`)} · {t(`voice.styles.${profile.style}`)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-5 rounded-2xl border border-black/10 bg-surface-modal p-5 dark:border-white/10 md:grid-cols-2">
          <RangeControl
            id="voice-speed"
            label={t('voice.speed')}
            valueLabel={`${voiceSpeed.toFixed(1)}×`}
            min={0.6}
            max={1.4}
            step={0.1}
            value={voiceSpeed}
            onChange={setVoiceSpeed}
          />
          <RangeControl
            id="voice-depth"
            label={t('voice.depth')}
            valueLabel={`${voiceDepth}%`}
            min={0}
            max={100}
            step={1}
            value={voiceDepth}
            onChange={setVoiceDepth}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <ToggleSetting
            label={t('voice.autoRead')}
            description={t('voice.autoReadDesc')}
            checked={voiceAutoRead}
            onChange={setVoiceAutoRead}
          />
          <ToggleSetting
            label={t('voice.autoSend')}
            description={t('voice.autoSendDesc')}
            checked={voiceAutoSend}
            onChange={setVoiceAutoSend}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">{t('voice.privateTitle')}</p>
            <p className="mt-1 text-meta text-emerald-800/70 dark:text-emerald-300/70">{t('voice.privateDesc')}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={testing}
            onClick={() => void testVoice()}
            data-testid="voice-test-button"
            className="shrink-0 rounded-full border-emerald-500/25 bg-transparent"
          >
            <Volume2 className={cn('mr-2 h-4 w-4', testing && 'animate-pulse')} />
            {testing ? t('voice.testing') : t('voice.test')}
          </Button>
        </div>
      </div>
    </section>
  );
}

function RangeControl({
  id,
  label,
  valueLabel,
  min,
  max,
  step,
  value,
  onChange,
}: {
  id: string;
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
        <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold tabular-nums dark:bg-white/10">{valueLabel}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-black/10 accent-cyan-600 dark:bg-white/10"
      />
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-black/10 bg-surface-modal p-4 dark:border-white/10">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-1 text-meta leading-5 text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
