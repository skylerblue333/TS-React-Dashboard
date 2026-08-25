# SkyForms — Wave 2 slot #132

SkyForms is an engineering-beta form/schema validation library. It defines bounded text, number, and choice fields; validates form definitions with Zod; rejects duplicate field IDs; validates caller-supplied submissions; and reports deterministic field errors.

## SKYCOIN4444 integration

Validation output uses `sky.forms.validation-result.v1` with `formId`, schema `version`, `valid`, `errors`, and a defensive snapshot of submitted values. Platform components can use this contract before handing accepted data to their own storage or workflow layers.

## Boundaries

This module does not render a hosted form UI, authenticate respondents, persist submissions, upload files, execute submitted content, send notifications, encrypt records, enforce tenant policy, or establish compliance/production deployment. Consumers remain responsible for authorization, sensitive-data policy, durable storage, retention, and transport security.

## Verification

The existing repository CI performs a frozen dependency install, TypeScript build, Jest tests, high-severity runtime dependency audit, non-root image verification, and a liveness smoke test. SkyForms tests cover accepted submissions, deterministic validation failures, malformed definitions, and duplicate field IDs.
