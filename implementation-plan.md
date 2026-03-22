# Implementation Plan — REX Export Permit Test Automation

## Stack
- **Framework:** Playwright
- **Language:** TypeScript
- **Services:** RexSubmissionService (ORDER/LODGE/AMEND), REXCertificateService (REPLACE)
- **Environments:** SIT, SIT2, VND

---

## Phase 1 — Project Structure & Config
**Goal:** Establish the foundation — folder structure, environment configuration files, and update playwright.config.ts for API + UI hybrid testing.

**Tasks:**
- [x] Define and create folder structure under `src/`
- [x] Create environment config files for SIT, SIT2, VND (SOAP credentials + staff portal credentials + URLs)
- [x] Update `playwright.config.ts` — remove unused browser projects, add dotenv, configure for hybrid testing
- [x] Add `.env` loading support

**Status:** Complete

---

## Phase 2 — TypeScript Interfaces
**Goal:** Define strongly-typed interfaces for the full LodgeRex payload structure.

**Tasks:**
- [x] Define `Identification` interface (rexNumber, lastAmendDateTime) — AMEND only
- [x] Define `ExportDetails` interface (destinationCountry, departureDate, consigneeDetails, transportDetails, etc.)
- [x] Define `CertificateDetails` interface (certificatePrintIndicator, certificates)
- [x] Define `ProductLine` interface (productType, packType, preservationType, suppCode, packaging, weights, etc.)
- [x] Define `ProductLines` interface (array of ProductLine)
- [x] Define root `LodgeRexPayload` interface combining all sections
- [x] Define commodity-specific section interfaces (Fish, Wool, SkinsAndHides, InedibleMeat) — excluded for Horticulture

**Status:** Complete

---

## Phase 3 — Payload Builder
**Goal:** Builder class that constructs the SOAP XML envelope from TypeScript objects, handles optional/omitted fields cleanly.

**Tasks:**
- [x] Create payload builder functions for all 5 services
- [x] Implement XML serialization from TypeScript payload object
- [x] Handle optional fields — omit from XML when not provided
- [x] Handle section-level omission (e.g. omit entire `identification` section for LODGE)
- [x] Handle commodity-specific section switching (Fish / Wool / SkinsAndHides / Horticulture)
- [x] Handle multiple product lines (1–500)
- [x] Add SOAP namespaces to envelope per service

**Status:** Complete

---

## Phase 4 — SOAP Client
**Goal:** HTTP client wrapper that sends SOAP requests and parses responses.

**Tasks:**
- [x] Create `SoapClient` class
- [x] Send requests to `RexSubmissionService` (ORDER/LODGE/AMEND)
- [x] Send requests to `REXCertificateService` (REPLACE)
- [x] Parse XML response → TypeScript object
- [x] Extract `REXNumber` and `lastAmendmentTimestamp` from successful LODGE response
- [x] Extract error/fault messages from failed responses
- [x] Add SOAP header injection (vendorToken, clientGroupToken, clientToken, username, password)

**Status:** Complete

---

## Phase 5 — Base Test Fixtures
**Goal:** Playwright fixtures for shared setup, environment switching, and ORDER helper.

**Tasks:**
- [x] Create environment fixture — loads correct credentials based on target env (SIT/SIT2/VND)
- [x] Create SOAP client fixture — initialised per test with correct env credentials
- [x] Create ORDER helper — sends ORDER payload and returns reference ID
- [x] Create LODGE helper — sends LODGE payload using reference ID, returns REXNumber + lastAmendmentTimestamp
- [x] Create READ helper — calls ReadRexService with REXNumber, returns latest lastAmendmentTimestamp
- [x] Apply rule: READ helper is always called after any staff portal action before continuing with SOAP requests
- [x] Wire fixtures into Playwright test context

**Status:** Complete

---

## Phase 6 — First Test Cases (TC01–TC08)
**Goal:** Implement BR-002-01 — departure date limit by destination country.

**Test Cases:**
- [x] TC01 — Mango → SG, departure > 28 days → Accepted (exempt)
- [x] TC02 — Mango → HK, departure > 28 days → Accepted (exempt)
- [x] TC03 — Mango → MY, departure > 28 days → Accepted (exempt)
- [x] TC04 — Mango → MV, departure > 28 days → Accepted (exempt)
- [x] TC05 — TUR → SG, departure > 28 days → Rejected
- [x] TC06 — TUR → HK, departure > 28 days → Rejected
- [x] TC07 — TUR → MY, departure > 28 days → Rejected
- [x] TC08 — TUR → MV, departure > 28 days → Rejected

**Status:** Complete

---

## Phase 7 — Test Cases (TC09–TC16)
**Goal:** Implement BR-003 — certificate requirement, print indicator, information message 750.

**Test Cases:**
- [ ] TC09 — Mango → GB, Print Indicator = Auto → COMP, Message 750 displayed
- [ ] TC10 — Mango → GB, Print Indicator = Manual → COMP, Message 750 displayed
- [ ] TC11 — Mango → GB, Print Indicator = None → COMP, Message 750 NOT displayed
- [ ] TC12 — TBC product → TBC destination, Print Indicator = Auto → Message 750 NOT displayed
- [ ] TC13 — TBC product → TBC destination, Print Indicator = Manual → Message 750 NOT displayed
- [ ] TC14 — TBC product → TBC destination, Print Indicator = None → Message 750 NOT displayed
- [ ] TC15 — Lodge Mango → GB, Amend to BAN, Print Indicator = Auto → Message 750 displayed
- [ ] TC16 — Lodge Mango → GB, Amend to BAN, Print Indicator = Manual → Message 750 displayed

**Status:** Not Started

---

## Phase 8 — Staff Portal Page Object
**Goal:** Reusable Page Object for all staff portal interactions.

**Tasks:**
- [ ] Create `StaffPortalPage` class
- [ ] Implement `login(username, password)` method
- [ ] Implement `findByREXNumber(rexNumber)` method
- [ ] Implement `addInspectionDetails(startDate, endDate, ...fields)` method
- [ ] Implement `authorise(comments)` method — click authorise link + enter comments + submit
- [ ] Implement `getREXStatus()` method — returns current status (CertificateReady / INSPECTION)
- [ ] Implement `assertREXStatus(expectedStatus)` assertion helper

**Status:** Not Started

---

## Phase 9 — Hybrid Test Cases (REPLACE flow)
**Goal:** Implement end-to-end REPLACE test cases combining SOAP + staff portal steps.

**Tasks:**
- [ ] Implement full REPLACE flow: ORDER → LODGE → Staff Portal (authorise) → REPLACE
- [ ] Assert REX status = CertificateReady before REPLACE
- [ ] Assert REPLACE response after successful authorisation
- [ ] Implement INSPECTION status scenario (missing consignee/voyage) — REPLACE blocked

**Status:** Not Started

---

## Phase 10 — Reporting & CI Config
**Goal:** Polish reporting and enable environment switching via CLI.

**Tasks:**
- [ ] Tune HTML reporter — open on failure only
- [ ] Enable environment selection via CLI flag (e.g. `ENV=SIT npx playwright test`)
- [ ] Add test tagging by environment, payload type, business rule
- [ ] Verify report shows SOAP request/response bodies on failure
- [ ] Document how to run tests per environment

**Status:** Not Started

---

*Updated incrementally as phases are completed.*
