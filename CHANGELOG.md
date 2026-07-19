# Changelog

## 0.2.0

- Redesign dilution around direct concentration inputs and explicit final-volume / available-volume workflows.
- Expand infusion dose-rate support for weight-based `/min` and `/h` dosing plus optional hours-to-run volume rate.
- Add hash URLs for calculator and validation screens so reload preserves the current screen.
- Use placeholder examples instead of prefilled calculator values and select field contents on focus.
- PWA cache version bump to refresh installed clients.

## 0.1.1

- Documentation and deployment hygiene update before clinical terminology and calculation validation.
- Production deployment details are secret-backed and no longer documented in repository files.
- PWA cache version bump to refresh installed clients.

## 0.1.0

- Initial four calculators: dose from prepared solution, dilution, vial reconstitution, and infusion rate.
- Local history and templates stored in the browser.
- QR sharing for calculation inputs.
- Printable/copyable preparation label.
- Bulgarian interface with centralized text.
- Safety warnings, unit conversion traces, and calculation verification.
- Accessibility hardening for field errors, focus behavior, and live result regions.
- PWA manifest and offline service worker support.
