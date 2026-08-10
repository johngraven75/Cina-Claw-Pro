import { motion } from 'framer-motion';
import { ArrowUpRight, Bot, BrainCircuit, CalendarClock, Eye, Layers3, Puzzle, ShieldCheck, Sparkles, Waves, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGatewayStore } from '@/stores/gateway';
import { useProviderStore } from '@/stores/providers';
import { cn } from '@/lib/utils';

const entrance = {
  hidden: { opacity: 0, y: 14 },
  visible: (index: number) => ({ opacity: 1, y: 0, transition: { delay: index * 0.07, duration: 0.48, ease: [0.16, 1, 0.3, 1] as const } }),
};

export function CinaCommandCenter() {
  const { t } = useTranslation('chat');
  const gateway = useGatewayStore((state) => state.status);
  const accounts = useProviderStore((state) => state.accounts);
  const defaultAccountId = useProviderStore((state) => state.defaultAccountId);
  const gatewayOnline = gateway.state === 'running' && gateway.gatewayReady !== false;
  const defaultAccount = accounts.find((account) => account.id === defaultAccountId);
  const configuredAccounts = accounts.filter((account) => account.enabled).length;
  const launches = [
    { icon: BrainCircuit, title: t('commandCenter.launches.models.title'), description: t('commandCenter.launches.models.description'), meta: t('commandCenter.launches.models.meta'), route: '/models', accent: 'from-cyan-400/30 via-blue-500/15 to-transparent' },
    { icon: Bot, title: t('commandCenter.launches.agents.title'), description: t('commandCenter.launches.agents.description'), meta: t('commandCenter.launches.agents.meta'), route: '/agents', accent: 'from-violet-400/30 via-fuchsia-500/15 to-transparent' },
    { icon: CalendarClock, title: t('commandCenter.launches.automations.title'), description: t('commandCenter.launches.automations.description'), meta: t('commandCenter.launches.automations.meta'), route: '/cron', accent: 'from-amber-300/30 via-orange-500/15 to-transparent' },
    { icon: Puzzle, title: t('commandCenter.launches.skills.title'), description: t('commandCenter.launches.skills.description'), meta: t('commandCenter.launches.skills.meta'), route: '/skills', accent: 'from-emerald-300/30 via-teal-500/15 to-transparent' },
  ];

  return (
    <div data-testid="acp-chat-empty-state" className="cina-command-center relative mx-auto flex min-h-[33rem] w-full max-w-6xl flex-col justify-center overflow-hidden px-2 py-8 text-left">
      <div className="cina-aurora" aria-hidden="true" /><div className="cina-grid" aria-hidden="true" />
      <span className="sr-only">{t('welcome.subtitle')}</span>
      <div className="relative z-10 grid items-center gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.div custom={0} variants={entrance} initial="hidden" animate="visible" className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 shadow-[0_0_30px_rgba(34,211,238,0.1)] dark:text-cyan-200"><Sparkles className="h-3.5 w-3.5" />{t('commandCenter.eyebrow')}</motion.div>
          <motion.h1 custom={1} variants={entrance} initial="hidden" animate="visible" className="max-w-4xl text-5xl font-semibold leading-[0.94] tracking-[-0.055em] text-foreground sm:text-6xl 2xl:text-7xl">{t('commandCenter.titleLead')} <span className="cina-gradient-text">{t('commandCenter.titleAccent')}</span></motion.h1>
          <motion.p custom={2} variants={entrance} initial="hidden" animate="visible" className="mt-6 max-w-2xl text-base leading-7 text-foreground/65 sm:text-lg">{t('commandCenter.description')}</motion.p>
          <motion.div custom={3} variants={entrance} initial="hidden" animate="visible" className="mt-7 flex flex-wrap gap-2.5">
            <Capability icon={Eye} label={t('commandCenter.capabilities.multimodal')} /><Capability icon={Layers3} label={t('commandCenter.capabilities.multiAgent')} /><Capability icon={Zap} label={t('commandCenter.capabilities.autonomous')} /><Capability icon={ShieldCheck} label={t('commandCenter.capabilities.secure')} />
          </motion.div>
        </div>
        <motion.div custom={2} variants={entrance} initial="hidden" animate="visible" className="cina-core-card relative mx-auto w-full max-w-md rounded-[2rem] border border-white/15 bg-slate-950/[0.88] p-5 text-white shadow-[0_35px_100px_rgba(2,6,23,0.5)] backdrop-blur-2xl">
          <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.22),transparent_36%),radial-gradient(circle_at_88%_18%,rgba(168,85,247,0.22),transparent_35%)]" />
          <div className="relative"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/70">{t('commandCenter.core.title')}</p><p className="mt-2 text-xl font-semibold">{t('commandCenter.core.subtitle')}</p></div><div className="cina-orb flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-300/10"><Waves className="h-7 w-7 text-cyan-200" /></div></div>
            <div className="mt-8 space-y-3"><CoreMetric label={t('commandCenter.core.gateway')} value={gatewayOnline ? t('commandCenter.core.online') : t('commandCenter.core.starting')} positive={gatewayOnline} /><CoreMetric label={t('commandCenter.core.model')} value={defaultAccount?.model || (configuredAccounts > 0 ? t('commandCenter.core.ready') : t('commandCenter.core.needsProvider'))} positive={configuredAccounts > 0} /><CoreMetric label={t('commandCenter.core.autonomy')} value={t('commandCenter.core.guarded')} positive /></div>
            <button type="button" onClick={() => { window.location.hash = '/models'; }} className="mt-6 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3.5 text-sm font-medium transition hover:-translate-y-0.5 hover:border-cyan-200/30 hover:bg-white/[0.11]"><span>{t('commandCenter.core.configure')}</span><ArrowUpRight className="h-4 w-4 text-cyan-200" /></button>
          </div>
        </motion.div>
      </div>
      <motion.div custom={4} variants={entrance} initial="hidden" animate="visible" className="relative z-10 mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {launches.map((launch) => <button key={launch.route} type="button" onClick={() => { window.location.hash = launch.route; }} className="cina-launch-card group relative overflow-hidden rounded-2xl border border-black/[0.07] bg-white/65 p-4 text-left shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 dark:border-white/[0.08] dark:bg-white/[0.045]"><div className={cn('absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity group-hover:opacity-100', launch.accent)} /><div className="relative"><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.06] bg-white/70 dark:border-white/10 dark:bg-white/[0.08]"><launch.icon className="h-5 w-5" /></span><ArrowUpRight className="h-4 w-4 text-muted-foreground" /></div><h2 className="mt-5 text-base font-semibold">{launch.title}</h2><p className="mt-1.5 min-h-10 text-sm leading-5 text-foreground/60">{launch.description}</p><p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/45">{launch.meta}</p></div></button>)}
      </motion.div>
    </div>
  );
}

function Capability({ icon: Icon, label }: { icon: typeof Eye; label: string }) { return <span className="inline-flex items-center gap-2 rounded-xl border border-black/[0.07] bg-white/55 px-3 py-2 text-xs font-medium text-foreground/70 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]"><Icon className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-300" />{label}</span>; }
function CoreMetric({ label, value, positive }: { label: string; value: string; positive: boolean }) { return <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-black/20 px-3.5 py-3"><span className="text-xs text-slate-400">{label}</span><span className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-100"><span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', positive ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-amber-300')} /><span className="truncate">{value}</span></span></div>; }
