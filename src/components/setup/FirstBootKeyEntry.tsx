/**
 * FirstBootKeyEntry
 *
 * A single, focused OpenRouter API key entry for the first-boot setup
 * wizard. It exists so a new user does not have to open the full provider
 * dialog to get going: paste the key once, save it, and the setup wizard
 * can proceed with the OpenRouter successor model (the retired model
 * default must never be seeded again; the app-wide keyless default is
 * the local Ollama model).
 *
 * Retention: the key is never kept in renderer state beyond the input
 * field, never written to localStorage, and never rendered back. Saving
 * goes through the provider store, which hands the key to the main
 * process secret store (operating-system secure storage). On every
 * later boot the app reloads the provider snapshot, so the saved key is
 * picked up again automatically without re-entering it.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyRound, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProviderStore } from '@/stores/providers';
import { buildProviderAccountId } from '@/lib/provider-accounts';
import { normalizeProviderApiKeyInput, type ProviderAccount } from '@/lib/providers';
import { OPENROUTER_DEFAULT_MODEL_ID } from '@shared/openrouter';

const OPENROUTER_VENDOR_ID = 'openrouter';

export function FirstBootKeyEntry() {
  const { t } = useTranslation('setup');
  const accounts = useProviderStore((state) => state.accounts);
  const vendors = useProviderStore((state) => state.vendors);
  const statuses = useProviderStore((state) => state.statuses);
  const createAccount = useProviderStore((state) => state.createAccount);
  const updateAccount = useProviderStore((state) => state.updateAccount);
  const setDefaultAccount = useProviderStore((state) => state.setDefaultAccount);

  const [key, setKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openRouterAccount = accounts.find((account) => account.vendorId === OPENROUTER_VENDOR_ID);
  const hasSavedKey = openRouterAccount
    ? (statuses.find((status) => status.id === openRouterAccount.id)?.hasKey ?? false)
    : false;

  const handleSave = async () => {
    const normalizedKey = normalizeProviderApiKeyInput(key);
    if (!normalizedKey) {
      setError(t('provider.firstBootKey.errorEmpty'));
      setSaved(false);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      let accountId: string;
      if (openRouterAccount) {
        accountId = openRouterAccount.id;
        // Only enable the account and replace its key. An existing model
        // choice is left alone so saving a key never clobbers it.
        await updateAccount(accountId, { enabled: true }, normalizedKey);
      } else {
        const now = new Date().toISOString();
        const account: ProviderAccount = {
          id: buildProviderAccountId(OPENROUTER_VENDOR_ID, null, vendors),
          vendorId: OPENROUTER_VENDOR_ID,
          label: 'OpenRouter — GLM 5.3 Flash',
          authMode: 'api_key',
          model: OPENROUTER_DEFAULT_MODEL_ID,
          enabled: true,
          isDefault: false,
          createdAt: now,
          updatedAt: now,
        };
        accountId = account.id;
        await createAccount(account, normalizedKey);
      }

      // Make the key-bearing account the default when nothing is default
      // yet, so first boot actually chats through it.
      const currentDefaultId = useProviderStore.getState().defaultAccountId;
      if (!currentDefaultId) {
        await setDefaultAccount(accountId);
      }

      setKey('');
      setSaved(true);
    } catch {
      setError(t('provider.firstBootKey.errorFailed'));
      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="first-boot-key-entry" className="rounded-xl border bg-card p-4 text-left">
      <div className="flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-primary" />
        <h3 className="font-medium">{t('provider.firstBootKey.title')}</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{t('provider.firstBootKey.description')}</p>
      <div className="mt-3 space-y-2">
        <Label htmlFor="first-boot-key-input">{t('provider.firstBootKey.title')}</Label>
        <div className="flex gap-2">
          <Input
            id="first-boot-key-input"
            data-testid="first-boot-key-input"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder={t('provider.firstBootKey.placeholder')}
            value={key}
            onChange={(event) => {
              setKey(event.target.value);
              setSaved(false);
              setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !saving) {
                void handleSave();
              }
            }}
          />
          <Button data-testid="first-boot-key-save" onClick={() => void handleSave()} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('provider.firstBootKey.saving')}
              </>
            ) : (
              t('provider.firstBootKey.save')
            )}
          </Button>
        </div>
        {hasSavedKey && (
          <p className="text-sm text-muted-foreground">{t('provider.firstBootKey.replaceHint')}</p>
        )}
        {saved && (
          <p data-testid="first-boot-key-status" className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            {t('provider.firstBootKey.saved')}
          </p>
        )}
        {error && (
          <p data-testid="first-boot-key-status" className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
