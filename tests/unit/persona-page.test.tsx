import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Persona } from '@/pages/Persona';
import { useSettingsStore } from '@/stores/settings';

const readText = vi.fn();
const writeText = vi.fn(async () => ({ ok: true }));
const createText = vi.fn(async () => ({ ok: true }));

vi.mock('@/lib/host-api', () => ({
  hostApi: {
    files: {
      readText: (...args: unknown[]) => readText(...args),
      writeText: (...args: unknown[]) => writeText(...args),
      createText: (...args: unknown[]) => createText(...args),
    },
  },
}));

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: Record<string, unknown>) =>
        typeof options?.path === 'string' ? `File: ${options.path}` : key,
    }),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  useSettingsStore.setState({ chatWorkspacePath: '~/.openclaw/workspace' } as never);
});

describe('Persona page', () => {
  it('loads the Soul file and saves edits back with writeText', async () => {
    readText.mockResolvedValue({ ok: true, content: '# Soul\n\nOriginal.' });
    render(<Persona />);

    await waitFor(() => {
      expect(screen.getByTestId('persona-editor')).toHaveValue('# Soul\n\nOriginal.');
    });
    expect(screen.getByTestId('persona-path')).toHaveTextContent(
      '~/.openclaw/workspace/SOUL.md',
    );

    fireEvent.change(screen.getByTestId('persona-editor'), {
      target: { value: '# Soul\n\nEdited.' },
    });
    fireEvent.click(screen.getByTestId('persona-save'));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('~/.openclaw/workspace/SOUL.md', '# Soul\n\nEdited.');
    });
    expect(createText).not.toHaveBeenCalled();
    expect(screen.getByTestId('persona-status')).toHaveTextContent('saved');
  });

  it('creates a missing Memory file with createText instead of failing', async () => {
    readText.mockResolvedValue({ ok: false, error: 'notFound' });
    render(<Persona />);

    fireEvent.click(screen.getByTestId('persona-tab-memory'));
    await waitFor(() => {
      expect(screen.getByTestId('persona-path')).toHaveTextContent(
        '~/.openclaw/workspace/MEMORY.md',
      );
    });

    fireEvent.change(screen.getByTestId('persona-editor'), {
      target: { value: '# Memory\n\nFirst note.' },
    });
    fireEvent.click(screen.getByTestId('persona-save'));

    await waitFor(() => {
      expect(createText).toHaveBeenCalledWith(
        '~/.openclaw/workspace/MEMORY.md',
        '# Memory\n\nFirst note.',
      );
    });
    expect(writeText).not.toHaveBeenCalled();
  });

  it('labels the System Prompt tab as the AGENTS.md file', async () => {
    readText.mockResolvedValue({ ok: true, content: '# Agents' });
    render(<Persona />);

    fireEvent.click(screen.getByTestId('persona-tab-system'));
    await waitFor(() => {
      expect(screen.getByTestId('persona-path')).toHaveTextContent(
        '~/.openclaw/workspace/AGENTS.md',
      );
    });
  });
});
