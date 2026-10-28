// Tests for the client skeleton: constants match the server exactly, the menu is
// built from every module's nav.js and filtered by role, and a shared UI stub renders.
// Run with `npm test -w client` (Vitest with jsdom, a fake browser).
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import * as clientConstants from '../shared/constants.js';
import * as serverConstants from '../../../server/src/shared/constants.js';
import { getModuleRoutes, getNavItems } from './moduleDiscovery.js';
import { Button, Stamp } from '../shared/ui/index.js';

afterEach(cleanup);

describe('shared constants', () => {
  it('are identical on client and server', () => {
    expect({ ...clientConstants }).toEqual({ ...serverConstants });
  });
});

describe('module discovery', () => {
  it('finds the routes of all four client modules', () => {
    const paths = getModuleRoutes().map((route) => route.path);
    expect(paths).toEqual(
      expect.arrayContaining(['/lost', '/found', '/verify', '/verify/desk', '/notifications'])
    );
  });

  it('shows admin pages only to admins, in order', () => {
    const studentLabels = getNavItems('student').map((item) => item.label);
    // Modules may add their own menu items, so check the main ones are there in this
    // order (sorted by `order`), rather than an exact list that breaks on every new item.
    const mainLabels = ['Lost', 'Found', 'My claims', 'Alerts'];
    const positions = mainLabels.map((label) => studentLabels.indexOf(label));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect([...positions].sort((first, second) => first - second)).toEqual(positions);
    expect(studentLabels).not.toContain('Analytics');
    expect(getNavItems('admin').map((item) => item.label)).toContain('Analytics');
  });
});

describe('shared UI stubs', () => {
  it('renders a button and a stamp with readable words', () => {
    const { getByRole, getByText } = render(
      <>
        <Button variant="secondary">Send claim</Button>
        <Stamp status="transferred_admin" />
      </>
    );
    expect(getByRole('button').textContent).toBe('Send claim');
    expect(getByText('Moved to admin office')).toBeTruthy();
  });
});
