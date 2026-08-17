# Cina-Claw Pro v1.0.4

## Release summary

Cina-Claw Pro v1.0.4 carries forward the security remediation from v1.0.3 and hardens cross-platform browser validation for the Windows release pipeline.

## Included changes

- Browser validation now generates the extension bridge before Vite compilation on clean checkouts.
- The Electron E2E workflow keeps the no-`NODE_OPTIONS` security rule and uses Node 22.22.3 only on macOS, avoiding the observed Node 24 arm64 Vite abort while retaining Node 24 on Linux and Windows.
- Dependency, CodeQL, and release-gate validation remain enforced before publication.

## Validation expectations

The release must pass type checking, unit and integration tests, carry-forward verification, production Vite build, Electron E2E on Linux/macOS/Windows, Windows packaging, checksum generation, and release artifact inventory.

Windows installers are unsigned unless the repository is supplied with a trusted Windows signing identity. Windows SmartScreen may display a warning for unsigned artifacts.
