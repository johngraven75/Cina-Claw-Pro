import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FirstBootKeyEntry } from '@/components/setup/FirstBootKeyEntry';
import { useProviderStore } from '@/stores/providers';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const createAccount = vi.fn(async () => undefined);
const updateAccount = vi.fn(async () => undefined);
const setDefaultAccount = vi.fn(async () => undefined);

function setProviderState(overrides: Record<string, unknown> = {}) {
  useProviderStore.setState({
    accounts: [],
    vendors: [],
    statuses: [],
    defaultAccountId: null,
    loading: false,
    error: null,
    createAccount,
    updateAccount,
    setDefaultAccount,
    ...overrides,
  } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  setProviderState();
});

describe('FirstBootKeyEntry', () => {
  it('creates an enabled OpenRouter account with the successor model and sets it as default', async () => {
    render(<FirstBootKeyEntry />);

    fireEvent.change(screen.getByTestId('first-boot-key-input'), {
      target: { value: 'sk-or-test-123' },
    });
    fireEvent.click(screen.getByTestId('first-boot-key-save'));

    await waitFor(() => {
      expect(createAccount).toHaveBeenCalledTimes(1);
    });
    const [account, apiKey] = createAccount.mock.calls[0] as [Record<string, unknown>, string];
    expect(account.vendorId).toBe('openrouter');
    expect(account.model).toBe('z-ai/glm-5.3-flash');
    expect(account.enabled).toBe(true);
    expect(apiKey).toBe('sk-or-test-123');
    expect(setDefaultAccount).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('first-boot-key-status')).toHaveTextContent(
      'provider.firstBootKey.saved',
    );
    expect(screen.getByTestId('first-boot-key-input')).toHaveValue('');
  });

  it('updates an existing OpenRouter account instead of creating a second one', async () => {
    const existing = {
      id: 'openrouter',
      vendorId: 'openrouter',
      label: 'OpenRouter — GLM 5.3 Flash',
      authMode: 'api_key',
      model: 'z-ai/glm-5.3-flash',
      enabled: true,
      isDefault: false,
      createdAt: '2026-11-02T00:00:00.000Z',
      updatedAt: '2026-11-02T00:00:00.000Z',
    };
    setProviderState({
      accounts: [existing],
      statuses: [{ id: 'openrouter', type: 'openrouter', hasKey: true }],
      defaultAccountId: 'openrouter',
    });

    render(<FirstBootKeyEntry />);
    expect(screen.getByText('provider.firstBootKey.replaceHint')).toBeTruthy();

    fireEvent.change(screen.getByTestId('first-boot-key-input'), {
      target: { value: 'sk-or-replacement' },
    });
    fireEvent.click(screen.getByTestId('first-boot-key-save'));

    await waitFor(() => {
      expect(updateAccount).toHaveBeenCalledTimes(1);
    });
    expect(createAccount).not.toHaveBeenCalled();
    expect(updateAccount.mock.calls[0][0]).toBe('openrouter');
    expect(updateAccount.mock.calls[0][2]).toBe('sk-or-replacement');
    expect(setDefaultAccount).not.toHaveBeenCalled();
  });

  it('refuses an empty key and saves nothing', async () => {
    render(<FirstBootKeyEntry />);
    fireEvent.click(screen.getByTestId('first-boot-key-save'));

    expect(screen.getByTestId('first-boot-key-status')).toHaveTextContent(
      'provider.firstBootKey.errorEmpty',
    );
    expect(createAccount).not.toHaveBeenCalled();
    expect(updateAccount).not.toHaveBeenCalled();
  });
});
