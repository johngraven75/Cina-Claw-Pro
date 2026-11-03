import { beforeEach, describe, expect, it } from 'vitest';
import { useArtifactPanel } from '@/stores/artifact-panel';

describe('task view mode', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useArtifactPanel.setState({ open: false, taskView: false, tab: 'changes' });
  });

  it('opens the panel on the Steps tab in TaskView mode', () => {
    useArtifactPanel.getState().openTaskView();
    expect(useArtifactPanel.getState()).toMatchObject({
      open: true,
      taskView: true,
      tab: 'steps',
    });
  });

  it('toggles TaskView off and closes the panel', () => {
    useArtifactPanel.getState().openTaskView();
    useArtifactPanel.getState().toggleTaskView();
    expect(useArtifactPanel.getState()).toMatchObject({ open: false, taskView: false });
  });

  it('clears TaskView mode on close', () => {
    useArtifactPanel.getState().openTaskView();
    useArtifactPanel.getState().close();
    expect(useArtifactPanel.getState()).toMatchObject({ open: false, taskView: false });
  });

  it('accepts steps as a panel tab', () => {
    useArtifactPanel.getState().setTab('steps');
    expect(useArtifactPanel.getState().tab).toBe('steps');
  });
});
