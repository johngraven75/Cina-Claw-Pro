import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cloud, Cpu, Eye, Wrench } from 'lucide-react';
import { useProviderStore } from '@/stores/providers';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  FREE_MODELS,
  FREE_MODEL_TIERS,
  OPENROUTER_SUCCESSOR_PICK,
  filterFreeModels,
  isSelectableFreeModel,
  targetModelId,
  targetVendorId,
  type FreeModel,
  type FreeModelTier,
} from '@/lib/free-model-catalog';

type TierFilter = FreeModelTier | 'all';
type Status = { kind: 'saved' } | { kind: 'failed' } | { kind: 'needs-provider'; provider: string } | null;

export function FreeModelCatalog() {
  const { t } = useTranslation('dashboard');
  const accounts = useProviderStore((state) => state.accounts);
  const updateAccount = useProviderStore((state) => state.updateAccount);
  const setDefaultAccount = useProviderStore((state) => state.setDefaultAccount);
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState<TierFilter>('all');
  const [showUncensored, setShowUncensored] = useState(false);
  const [expandedRank, setExpandedRank] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [busyRank, setBusyRank] = useState<number | null>(null);

  const hiddenUncensoredCount = FREE_MODELS.filter((model) => model.uncensored).length;
  const visible = useMemo(
    () => filterFreeModels(FREE_MODELS, { query, tier, showUncensored }),
    [query, tier, showUncensored],
  );

  const scrollToProviders = () => {
    document.getElementById('provider-settings')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUseVendorModel = async (
    vendorId: 'openrouter' | 'ollama',
    modelId: string,
    busyKey: number,
  ) => {
    const account = accounts.find((candidate) => candidate.vendorId === vendorId && candidate.enabled);
    if (!account) {
      setStatus({ kind: 'needs-provider', provider: vendorId });
      scrollToProviders();
      return;
    }
    setBusyRank(busyKey);
    setStatus(null);
    try {
      if (vendorId === 'ollama') {
        const customModels = Array.from(
          new Set([modelId, ...(account.metadata?.customModels ?? [])]),
        );
        await updateAccount(account.id, {
          model: modelId,
          metadata: { ...(account.metadata ?? {}), customModels },
        });
      } else {
        await updateAccount(account.id, { model: modelId });
      }
      await setDefaultAccount(account.id);
      setStatus({ kind: 'saved' });
    } catch {
      setStatus({ kind: 'failed' });
    } finally {
      setBusyRank(null);
    }
  };

  const handleUseModel = async (model: FreeModel) => {
    const vendorId = targetVendorId(model);
    if (!vendorId) return;
    await handleUseVendorModel(vendorId, targetModelId(model), model.rank);
  };

  const successorAccount = accounts.find(
    (candidate) => candidate.vendorId === OPENROUTER_SUCCESSOR_PICK.vendorId && candidate.enabled,
  );
  const successorSelected = successorAccount?.model === OPENROUTER_SUCCESSOR_PICK.modelId;

  return (
    <section
      data-testid="free-model-catalog"
      className="relative overflow-hidden rounded-3xl border border-black/10 bg-surface-modal p-6 dark:border-white/10"
    >
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">
            {t('freeCatalog.eyebrow')}
          </div>
          <h2 className="text-3xl font-serif font-normal tracking-tight text-foreground">
            {t('freeCatalog.title')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground/60">
            {t('freeCatalog.description')}
          </p>
        </div>

        <article
          data-testid="free-catalog-featured-successor"
          className="rounded-2xl border border-black/10 bg-background p-4 dark:border-white/10"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{t('freeCatalog.successorPick')}</p>
              <p className="mt-1 font-mono text-[11px] text-foreground/45">{OPENROUTER_SUCCESSOR_PICK.modelId}</p>
            </div>
            <span className="inline-flex items-center gap-1 self-center text-[11px] text-foreground/45">
              <Cloud className="h-3 w-3" />
              {OPENROUTER_SUCCESSOR_PICK.vendorId}
            </span>
          </div>
          <p className="mt-2 text-sm leading-5 text-foreground/60">
            {t('freeCatalog.successorPickDescription')}
          </p>
          <p className="mt-1 text-xs leading-5 text-foreground/60">{t('freeCatalog.successorPickNote')}</p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              data-testid="free-catalog-use-successor"
              disabled={busyRank === 0}
              onClick={() =>
                handleUseVendorModel(OPENROUTER_SUCCESSOR_PICK.vendorId, OPENROUTER_SUCCESSOR_PICK.modelId, 0)
              }
              className={cn(
                'rounded-xl px-3 py-2 text-sm font-semibold',
                successorSelected
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'bg-foreground text-background',
              )}
            >
              {successorSelected ? t('freeCatalog.selected') : t('freeCatalog.useModel')}
            </button>
            {!successorAccount && (
              <button
                type="button"
                onClick={scrollToProviders}
                className="rounded-xl border border-black/[0.08] px-3 py-2 text-sm font-semibold text-foreground/70 dark:border-white/[0.08]"
              >
                {t('freeCatalog.configureProvider')}
              </button>
            )}
          </div>
        </article>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            data-testid="free-catalog-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('freeCatalog.searchPlaceholder')}
            className="w-full rounded-full border border-black/10 bg-surface-input px-4 py-2 text-sm text-foreground dark:border-white/10 lg:max-w-sm"
          />
          <div
            className="flex flex-wrap gap-1 rounded-full bg-surface-input p-1"
            role="group"
            aria-label={t('freeCatalog.title')}
          >
            {(['all', ...FREE_MODEL_TIERS] as TierFilter[]).map((value) => (
              <button
                key={value}
                type="button"
                data-testid={`free-catalog-tier-${value}`}
                onClick={() => setTier(value)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold',
                  tier === value
                    ? 'bg-surface-modal text-foreground shadow-sm'
                    : 'text-foreground/60',
                )}
              >
                {value === 'all' ? t('freeCatalog.tiers.all') : t(`freeCatalog.tiers.${value}`)}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-foreground/70">
          <Switch
            data-testid="free-catalog-uncensored-toggle"
            checked={showUncensored}
            onCheckedChange={setShowUncensored}
          />
          <span>{t('freeCatalog.showUncensored')}</span>
        </label>
        {!showUncensored ? (
          <p className="text-sm text-foreground/60">
            {t('freeCatalog.hiddenUncensored', { count: hiddenUncensoredCount })}
          </p>
        ) : (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
            {t('freeCatalog.uncensoredWarning')}
          </p>
        )}

        {status?.kind === 'saved' && (
          <p data-testid="free-catalog-status" className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            {t('freeCatalog.saved')}
          </p>
        )}
        {status?.kind === 'failed' && (
          <p data-testid="free-catalog-status" className="text-sm font-semibold text-red-700 dark:text-red-300">
            {t('freeCatalog.saveFailed')}
          </p>
        )}
        {status?.kind === 'needs-provider' && (
          <p data-testid="free-catalog-status" className="text-sm font-semibold text-amber-700 dark:text-amber-300">
            {t('freeCatalog.needsProvider', { provider: status.provider })}
          </p>
        )}

        {visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-foreground/60">{t('freeCatalog.noResults')}</p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {visible.map((model) => {
              const vendorId = targetVendorId(model);
              const account = vendorId
                ? accounts.find((candidate) => candidate.vendorId === vendorId && candidate.enabled)
                : undefined;
              const modelId = targetModelId(model);
              const isSelected =
                !!account &&
                (account.model === modelId || account.metadata?.customModels?.includes(modelId));
              const selectable = isSelectableFreeModel(model);
              const expanded = expandedRank === model.rank;
              return (
                <article
                  key={model.rank}
                  data-testid={`free-catalog-card-${model.rank}`}
                  className="rounded-2xl border border-black/10 bg-background p-4 hover:border-black/20 dark:border-white/10 dark:hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{model.displayName}</p>
                      <p className="mt-1 font-mono text-[11px] text-foreground/45">{model.hfId}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-black/[0.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/55 dark:bg-white/[0.07]">
                      {t(`freeCatalog.tiers.${model.tier}`)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {model.modalities.map((modality) => (
                      <span
                        key={modality}
                        className="inline-flex items-center gap-1 rounded-lg border border-black/[0.05] bg-white/60 px-2 py-1 text-[10px] font-semibold text-foreground/55 dark:border-white/[0.07] dark:bg-white/[0.04]"
                      >
                        <Eye className="h-3 w-3" />
                        {t(`freeCatalog.modalities.${modality}`)}
                      </span>
                    ))}
                    <span className="inline-flex items-center gap-1 rounded-lg border border-black/[0.05] bg-white/60 px-2 py-1 text-[10px] font-semibold text-foreground/55 dark:border-white/[0.07] dark:bg-white/[0.04]">
                      <Wrench className="h-3 w-3" />
                      {t(`freeCatalog.reasoning.${model.reasoning}`)}
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-foreground/60">
                    {t('freeCatalog.size')}: {model.size} ·{' '}
                    {model.contextTokens
                      ? model.contextTokens.toLocaleString()
                      : t('freeCatalog.contextUnknown')}{' '}
                    · {t('freeCatalog.licence')}: {model.license}
                  </p>
                  {model.gated && (
                    <p className="mt-1 text-xs text-foreground/60">{t('freeCatalog.gated')}</p>
                  )}
                  {model.uncensored && (
                    <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                      {t('freeCatalog.localOnly')}
                    </p>
                  )}
                  <p className="mt-2 text-xs leading-5 text-foreground/60">
                    {t('freeCatalog.setup')}: {model.setupNeeded}
                  </p>

                  <div className="mt-4 flex gap-2">
                    {selectable ? (
                      <button
                        type="button"
                        data-testid={`free-catalog-use-${model.rank}`}
                        disabled={busyRank === model.rank}
                        onClick={() => handleUseModel(model)}
                        className={cn(
                          'rounded-xl px-3 py-2 text-sm font-semibold',
                          isSelected
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : 'bg-foreground text-background',
                        )}
                      >
                        {isSelected ? t('freeCatalog.selected') : t('freeCatalog.useModel')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        data-testid={`free-catalog-setup-${model.rank}`}
                        onClick={() => setExpandedRank(expanded ? null : model.rank)}
                        className="rounded-xl bg-foreground px-3 py-2 text-sm font-semibold text-background"
                      >
                        {expanded ? t('freeCatalog.hideSetup') : t('freeCatalog.showSetup')}
                      </button>
                    )}
                    {!account && selectable && (
                      <button
                        type="button"
                        onClick={scrollToProviders}
                        className="rounded-xl border border-black/[0.08] px-3 py-2 text-sm font-semibold text-foreground/70 dark:border-white/[0.08]"
                      >
                        {t('freeCatalog.configureProvider')}
                      </button>
                    )}
                    {selectable && (
                      <span className="ml-auto inline-flex items-center gap-1 self-center text-[11px] text-foreground/45">
                        {vendorId === 'ollama' ? <Cpu className="h-3 w-3" /> : <Cloud className="h-3 w-3" />}
                        {vendorId}
                      </span>
                    )}
                  </div>
                  {!selectable && expanded && (
                    <p className="mt-3 rounded-xl bg-black/[0.04] px-3 py-2 font-mono text-[11px] leading-5 text-foreground/70 dark:bg-white/[0.05]">
                      {model.hfId}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
