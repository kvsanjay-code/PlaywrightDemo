# Test Automation Requirements

## System Under Test
- **Protocol:** SOAP-based API
- **Domain:** Export Permit Management

## Test Automation Stack
- **Framework:** Playwright
- **Language:** TypeScript

---

## Actors
- **Exporter** — lodges the request for an export permit

---

## Payload Types & SOAP Operations

| Payload Type | SOAP Service | Namespace | Root Element |
|--------------|-------------|-----------|--------------|
| ORDER | RexSubmissionService | OrderRexSoap_1.0 | ord:OrderRex |
| LODGE | RexSubmissionService | LodgeRexSoap_1.0 | lod:LodgeRex |
| AMEND | RexSubmissionService | AmendRexSoap_1.0 | amen:AmendRex |
| REPLACE | REXCertificateService | RexCertificateSoap_1.0 | rex:ReplaceCertificate |
| READ | ReadRexService | ReadRexSoap_1.0 | read:ReadRex |

**Workflow sequence:**
```
ORDER → LODGE → AMEND
                REPLACE (separate operation)
```

- ORDER, LODGE, and AMEND share the same SOAP service (RexSubmissionService) — differentiated by payload type field
- REPLACE uses a separate SOAP service (REXCertificateService)
- ORDER is a mandatory pre-lodge step — returns a reference ID used in the LODGE payload
- Most ORDER requests have no business rule validation — only a few ORDER rules exist (TBC)
- Business rule validation is primarily triggered on **LODGE**
- AMEND references the original ORDER/LODGE *(field name and full vs partial payload TBC)*

**Standard test flows:**

LODGE test:
```
Step 1: RexSubmissionService (ORDER) → returns reference ID
Step 2: RexSubmissionService (LODGE + reference ID) → assert business rule behaviour
```

AMEND test:
```
Step 1: RexSubmissionService (ORDER) → reference ID
Step 2: RexSubmissionService (LODGE + reference ID) → returns REXNumber + lastAmendmentTimestamp (unless business validation error)
Step 3: ReadRexService (READ + REXNumber) → get latest lastAmendmentTimestamp
Step 4: RexSubmissionService (AMEND + REXNumber + lastAmendmentTimestamp) → assert business rule behaviour
```

REPLACE test (hybrid — SOAP + UI):
```
Step 1: SOAP → RexSubmissionService (ORDER) → reference ID
Step 2: SOAP → RexSubmissionService (LODGE + reference ID) → must reach COMP status, returns REXNumber + lastAmendmentTimestamp
Step 3: UI   → Login to Staff Portal → find REXNumber → add inspection details → authorise → assert CertificateReady
Step 4: SOAP → ReadRexService (READ + REXNumber) → get latest lastAmendmentTimestamp after authorisation
Step 5: SOAP → REXCertificateService (REPLACE + REXNumber + lastAmendmentTimestamp) → replaces the certificate
```
- Staff portal authorisation is **mandatory** before REPLACE
- Every REPLACE test case is a hybrid test (SOAP + browser)

**LODGE Response Rules:**
- On **successful** lodgement → always returns `REXNumber` + `lastAmendmentTimestamp`
- On **business validation error** → does NOT return REXNumber or lastAmendmentTimestamp

---

## Environments
| Environment | Description |
|-------------|-------------|
| SIT         | System Integration Testing |
| SIT2        | System Integration Testing 2 |
| VND         | Vendor |

- Each environment has its own set of credentials — must be externalized (not hardcoded in tests)

| Config | Fields |
|--------|--------|
| SOAP credentials | vendorToken, clientGroupToken, clientToken, username, password |
| Staff Portal credentials | staffUsername, staffPassword |
| Staff Portal URL | per environment (TBC) |

---

## Authentication
- SOAP header fields: `vendorToken`, `clientGroupToken`, `clientToken`, `username`, `password`
- **Scope:** Happy path only — valid credentials per environment
- Negative auth scenarios (invalid token, lockout, expired credentials) are **out of scope**

---

## Business Rule Domains (In Progress)

### BR-001 — Exporter Registration
- Exporter must be registered in the client portal to lodge a permit request
- *(further rules TBC — e.g. registration status: active/suspended/expired)*

### BR-002 — Destination Country

#### BR-002-01: Departure Date Limit by Destination Country
- When destination country is **SG, HK, MY, or MV**, departure date cannot be more than **28 days** from lodgement date
- **Exception:** Product type **Mango** is exempt from this rule — departure date can exceed 28 days

| TC# | Destination | Product | Departure > 28 days | Expected Result |
|-----|-------------|---------|----------------------|-----------------|
| TC01 | SG | Mango | Yes | ✅ Accepted (exempt) |
| TC02 | HK | Mango | Yes | ✅ Accepted (exempt) |
| TC03 | MY | Mango | Yes | ✅ Accepted (exempt) |
| TC04 | MV | Mango | Yes | ✅ Accepted (exempt) |
| TC05 | SG | TUR | Yes | ❌ Rejected (> 28 days not allowed) |
| TC06 | HK | TUR | Yes | ❌ Rejected (> 28 days not allowed) |
| TC07 | MY | TUR | Yes | ❌ Rejected (> 28 days not allowed) |
| TC08 | MV | TUR | Yes | ❌ Rejected (> 28 days not allowed) |

### BR-003 — Certificate Requirement + Print Indicator + Information Message 750

#### BR-003-01: Certificate Not Required — Mango to GB
- When product is **Mango** and destination is **GB**, certificate is NOT required
- Request goes to status **COMP**
- **Print Indicator = Auto or Manual** → Information Message 750 is displayed
- **Print Indicator = None** → Information Message 750 is NOT displayed

| TC# | Product | Destination | Print Indicator | Expected Status | Message 750 |
|-----|---------|-------------|-----------------|-----------------|-------------|
| TC09 | Mango | GB | Auto | COMP | ✅ Displayed |
| TC10 | Mango | GB | Manual | COMP | ✅ Displayed |
| TC11 | Mango | GB | None | COMP | ❌ Not Displayed |

#### BR-003-02: Information Message 750 Not Displayed — Any Print Indicator
- For orders where certificate IS required (product/destination TBC), Message 750 is not displayed regardless of Print Indicator

| TC# | Product | Destination | Print Indicator | Expected Status | Message 750 |
|-----|---------|-------------|-----------------|-----------------|-------------|
| TC12 | TBC | TBC | Auto | TBC | ❌ Not Displayed |
| TC13 | TBC | TBC | Manual | TBC | ❌ Not Displayed |
| TC14 | TBC | TBC | None | TBC | ❌ Not Displayed |

#### BR-003-03: Amendment — Product Change Triggers Message 750
- Lodge permit for **Mango → GB**, then amend product to **BAN** with Print Indicator Auto or Manual
- Expected: Information Message 750 is displayed after amendment

| TC# | Lodge | Amend Product | Print Indicator | Expected |
|-----|-------|---------------|-----------------|----------|
| TC15 | Mango → GB | BAN | Auto | Message 750 displayed |
| TC16 | Mango → GB | BAN | Manual | Message 750 displayed |

### BR-004 — Pack Type
- *(rules TBC)*

### BR-004 — Pack Type
- *(rules TBC)*

### BR-005 — Preservation
- *(rules TBC)*

### BR-006 — Supply Code
- *(rules TBC)*

### BR-007 — Departure Date
- *(rules TBC)*

### BR-008 — Quantities and Values
- *(rules TBC)*

### BR-009 — Amendments
- Exporter can amend a submitted permit request
- *(rules TBC — amendable fields, status restrictions, time limits, re-approval trigger)*

### BR-010 — Replacements
- Exporter can replace a submitted permit request
- *(rules TBC — difference from amendment, limits, inheritance from original)*

---

## Staff Portal

- Web application — URL differs per environment (SIT, SIT2, VND)
- Credentials differ per environment (staffUsername, staffPassword)
- Required for REPLACE test cases — and potentially mid-test for other flows
- Staff portal steps can occur **mid-test or at the end**, depending on the test case

**Staff Portal Flow:**
```
Step 1: Login (staffUsername, staffPassword)
Step 2: Find REXNumber
Step 3: Add inspection details:
        - Start Date
        - End Date
        - (additional inspection fields TBC)
Step 4: Click Authorise link
Step 5: Enter comments
Step 6: Submit
Step 7: Assert REX status has updated
```

**REX Status after authorisation:**
| Status | Meaning | Next Step |
|--------|---------|-----------|
| CertificateReady | All information complete, fully authorised | Proceed to REPLACE ✅ |
| INSPECTION | Missing information (e.g. consignee, voyage details) | Cannot REPLACE ❌ |

- After authorisation, assert the **REX status** on the staff portal before continuing
- The updated REX status is the trigger/precondition for subsequent SOAP calls (REPLACE or AMEND)
- REPLACE can only proceed when status = **CertificateReady**

**Design note:** Staff portal interactions must be implemented as reusable Page Object methods, callable at any point within a test.

**Rule — ReadRex after every staff portal action:**
After ANY action performed in the staff portal, always call `ReadRexService` to fetch the latest `lastAmendmentTimestamp` before continuing with subsequent SOAP requests (AMEND or REPLACE).
```
Staff Portal action → ReadRex (REXNumber) → get fresh lastAmendmentTimestamp → next SOAP call
```

---

## Out of Scope
- Negative authentication testing
- *(to be updated as brainstorming continues)*

---

*This document is being built incrementally through brainstorming sessions.*
