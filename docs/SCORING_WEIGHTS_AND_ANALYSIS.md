# ExtensionShield Scoring Weights & Analysis

This document describes the current scoring weights, how each section is computed, and the analysis performed against CRXplorer (factor coverage, CSP usage, and UI factor mapping).

---

## 1. Overview

- **Scoring Engine Version:** 2.0.0  
- **Weight Preset:** v1 (default)  
- **Single source of truth:** `ScoringEngine` in `src/extension_shield/scoring/engine.py`  
- **Weight definitions:** `src/extension_shield/scoring/weights.py`  
- **Factor normalization:** `src/extension_shield/scoring/normalizers.py`  
- **Hard gates:** `src/extension_shield/scoring/gates.py`

Scores are computed in three layers (Security, Privacy, Governance). Each layer has factors with severity `[0,1]` and confidence `[0,1]`. Layer scores are combined into an overall score; hard gates can override the final decision and apply penalties to layer scores.

---

## 2. Mathematical Foundation

### Layer score (per layer)

- **Risk:**  
  `R = Σ(w_i × c_i × s_i) / Σ(w_i × c_i)`
- **Layer score:**  
  `score = round(100 × (1 - R))`

Where:

- `w_i` = weight of factor `i` (within that layer)
- `c_i` = confidence in factor `i` ∈ [0, 1]
- `s_i` = severity of factor `i` ∈ [0, 1]

If `Σ(w_i × c_i) == 0`, the layer score is **100** (no risk).

### Overall score

Weighted average of the three layer scores (after gate penalties):

```
overall_score = security × 0.50 + privacy × 0.30 + governance × 0.20
```

### Coverage cap

If SAST coverage is missing (no files scanned, no findings) and `overall_score > 80`, it is capped at **80** and the decision is forced to **NEEDS_REVIEW**.

---

## 3. Layer Weights (Contribution to Overall Score)

| Layer      | Weight | Description                          |
|-----------|--------|--------------------------------------|
| Security  | 50%    | Code safety, malware, config, trust |
| Privacy   | 30%    | Permissions, exfil, capture         |
| Governance| 20%    | ToS, consistency, disclosure        |

**Total:** 1.0

---

## 4. Security Layer (50% of Overall)

Weights within the Security layer (sum = 1.0):

| Factor       | Weight | Description |
|-------------|--------|-------------|
| **SAST**    | 30%    | Static analysis findings (highest impact) |
| **VirusTotal** | 15% | Malware detection consensus |
| **Obfuscation** | 15% | Code obfuscation / hidden code |
| **Manifest** | 10% | Manifest security (CSP, MV2, broad host) |
| **ChromeStats** | 10% | Behavioral threat intelligence |
| **Webstore** | 10% | Store reputation (rating, users, privacy policy) |
| **Maintenance** | 10% | Update freshness / staleness |

**Code** (`src/extension_shield/scoring/weights.py`):

```python
SECURITY_WEIGHTS_V1: Dict[str, float] = {
    "SAST": 0.30,           # Static analysis findings (highest impact on security)
    "VirusTotal": 0.15,     # Malware detection consensus
    "Obfuscation": 0.15,    # Code obfuscation detection
    "Manifest": 0.10,       # Manifest security configuration
    "ChromeStats": 0.10,    # Behavioral threat intelligence
    "Webstore": 0.10,       # Webstore reputation signals
    "Maintenance": 0.10,    # Maintenance health (stale = higher risk)
}
```

### How each Security factor is computed

- **SAST**  
  - Exclude test files, dedupe by (rule_id, file_path, line).  
  - Weighted sum of findings (CRITICAL=15, HIGH=8, ERROR=3, MEDIUM=1.5, WARNING=0.5, INFO/LOW=0.1).  
  - Severity: `1 - exp(-0.12 × weighted_sum)`.  
  - Confidence: 1.0 if findings exist, 0.8 if analyzer ran with no findings, 0.6 if analyzer missing.

- **VirusTotal**  
  - Malicious count → base severity (0→0, 1→0.3, 2–4→0.6, 5–9→0.8, ≥10→1.0).  
  - Suspicious adds up to +0.2.  
  - Confidence: 1.0 if ≥30 engines, 0.7 if &lt;30, 0.4 if VT not enabled or no engines.

- **Obfuscation**  
  - `x = 2×obfuscated_files + 1×suspicious_files`.  
  - Severity: `1 - exp(-0.2 × x)`.  
  - Confidence reduced by popularity (e.g. ≥1M users → ×0.6, ≥100K → ×0.7).

- **Manifest** (includes **CSP**)  
  - Missing **Content Security Policy** → +0.3 severity.  
  - MV2 legacy (manifest_version &lt; 3) → +0.2.  
  - Broad host permissions → +0.3.  
  - Severity capped at 1.0. Confidence = 1.0 if manifest parsed.

- **ChromeStats**  
  - Uses precomputed risk score from ChromeStats; severity = saturating function of that score.  
  - Confidence 0.8 if enabled, 0.4 if not.

- **Webstore**  
  - Low rating (&lt;2→+0.4, &lt;3→+0.3, &lt;3.5→+0.15), low/unknown users, no privacy policy (+0.2).  
  - Severity capped at 1.0. Confidence from data availability (0.3–0.9).

- **Maintenance**  
  - Days since last update: &gt;365→0.8, 180–365→0.6, 90–180→0.4, &lt;90→0.1.  
  - Confidence 0.9 if date available, 0.3 if missing.

---

## 5. Privacy Layer (30% of Overall)

Weights within the Privacy layer (sum = 1.0):

| Factor               | Weight | Description |
|----------------------|--------|-------------|
| **PermissionsBaseline** | 25% | High-risk and unreasonable permission count |
| **PermissionCombos** | 25%   | Dangerous permission combinations |
| **NetworkExfil**    | 35%   | Network exfiltration patterns (highest privacy impact) |
| **CaptureSignals**  | 15%   | Screenshot / tab capture detection |

### How each Privacy factor is computed

- **PermissionsBaseline**  
  - `n = high_risk_permissions + unreasonable_permissions`.  
  - Severity: `1 - exp(-0.25 × n)`.  
  - Confidence 1.0 if permission data present.

- **PermissionCombos**  
  - Check dangerous combos (e.g. cookies+webRequest, clipboardRead+webRequest, debugger, nativeMessaging, broad host).  
  - Add fixed severity per combo; cap at 1.0.  
  - Confidence 1.0 if any permissions.

- **NetworkExfil**  
  - Domain risk (known good vs analytics vs unknown), suspicious flags (HTTP, base64, dynamic URL, credential/data harvest patterns), runtime URL construction, data-sending patterns.  
  - Severity: saturating function of combined risk.  
  - Confidence from network analysis; 0.5 if analysis not enabled.

- **CaptureSignals**  
  - Tab/desktop capture permissions, screenshot detection from permissions analysis, context (disclosed screenshot tool vs covert).  
  - Capture + network access adds severity.  
  - Severity capped at 1.0. Confidence 0.9 if manifest present.

---

## 6. Governance Layer (20% of Overall)

Weights within the Governance layer (sum = 1.0):

| Factor                | Weight | Description |
|-----------------------|--------|-------------|
| **ToSViolations**     | 50%    | Terms of service / policy violations |
| **Consistency**       | 30%    | Claimed purpose vs actual behavior |
| **DisclosureAlignment** | 20%  | Privacy policy vs data collection |

### How each Governance factor is computed

- **ToSViolations**  
  - Prohibited permissions (debugger, proxy, nativeMessaging): +0.5 per permission.  
  - Broad host + VirusTotal detection: +0.4.  
  - Travel-docs / visa portal automation risk (protected domains + injection/capture or ecosystem): severity up to 0.9.  
  - Severity capped at 1.0.

- **Consistency**  
  - Benign-claimed (theme, color, font, etc.) but high security/privacy risk → 0.6.  
  - “Offline” claim + broad host → 0.4.  
  - Confidence 0.8.

- **DisclosureAlignment**  
  - No privacy policy + data collection → 0.5; no policy + network → 0.3.  
  - Confidence 0.85.

---

## 7. Hard Gates & Penalties

Gates are evaluated in priority order. They can force **BLOCK** or **WARN** and also apply **numeric penalties** to layer scores.

### Gate order and behavior

| Order | Gate ID          | Condition (summary)                    | Decision | Layer penalty (if triggered) |
|-------|------------------|----------------------------------------|----------|------------------------------|
| 1     | VT_MALWARE       | ≥5 malicious engines                  | BLOCK    | Security −45                 |
|       |                  | 1–4 malicious                         | WARN     | (scaled)                     |
| 2     | CRITICAL_SAST    | ≥1 critical or ≥3 high or critical-high pattern | BLOCK | Security −50        |
| 3     | TOS_VIOLATION    | Prohibited perms, ext_connectable wildcard, travel-docs risk | BLOCK | Governance −60 |
| 4     | PURPOSE_MISMATCH | Credential/tracking patterns, benign claim + risky caps | WARN/BLOCK | Governance −45 |
| 5     | SENSITIVE_EXFIL  | Sensitive perms + network + no privacy policy (2+ factors) | WARN | Privacy −40 |

- **BLOCK:** penalty multiplier 1.0.  
- **WARN:** penalty multiplier 0.7.  
- Final penalty is also scaled by gate confidence.  
- Layer score after penalty: `max(0, score - penalty)`.

---

## 8. Decision Logic (Final Verdict)

Applied in order; first match wins:

| Priority | Condition                    | Decision     |
|----------|-----------------------------|--------------|
| 1        | Any blocking gate triggered  | **BLOCK**    |
| 2        | Security score &lt; 30        | **BLOCK**    |
| 3        | Overall score &lt; 30        | **BLOCK**    |
| 4        | Any warning gate triggered   | **NEEDS_REVIEW** |
| 5        | Security score &lt; 60        | **NEEDS_REVIEW** |
| 6        | Overall score &lt; 60        | **NEEDS_REVIEW** |
| 7        | (Coverage cap: SAST missing, overall &gt; 80) | **NEEDS_REVIEW**, overall capped at 80 |
| 8        | Otherwise                   | **ALLOW**    |

---

## 9. CSP (Content Security Policy) in Scoring

- **CSP is used** in the current pipeline.  
- It is part of the **Manifest** factor in the **Security** layer (10% of Security).  
- **Logic** (`normalize_manifest_posture` in `normalizers.py`):  
  - `manifest.content_security_policy` missing → **+0.3 severity** (and `issues` include `"missing_csp"`).  
  - MV2 and broad host add more severity; total severity is capped at 1.0.  
- **Effective impact:** Missing CSP contributes at most ~0.3 × 0.10 = **3%** of the Security layer risk (so roughly up to ~1.5 points of Security score for a 100-point scale).  
- CRXplorer treats missing CSP as a **standalone critical** category (e.g. 0% CSP); our model embeds it in Manifest and gives it a smaller visible impact unless we change weights or split CSP into its own factor.

---

## 10. Frontend Factor Mapping (lm-cat-items)

The UI shows each factor with a human-readable label, icon, and risk level. All **14 backend factors** are mapped in `frontend/src/components/report/LayerModal.jsx`:

**Security (7):**

| Factor name  | Label (UI)         | Category (grouping) |
|-------------|--------------------|---------------------|
| SAST        | Code Safety        | Code Checks         |
| VirusTotal  | Malware Scan       | Threat Detection    |
| Obfuscation | Hidden Code        | Code Checks         |
| Manifest    | Extension Config   | Code Checks         |
| ChromeStats | Threat Intelligence| Threat Detection    |
| Webstore    | Store Reputation   | Trust Signals       |
| Maintenance | Update Freshness   | Trust Signals       |

**Privacy (4):**

| Factor name         | Label (UI)           | Category           |
|---------------------|----------------------|--------------------|
| PermissionsBaseline | Permission Risk      | What It Can Access |
| PermissionCombos    | Dangerous Combos     | What It Can Access |
| NetworkExfil        | Data Sharing         | Data Handling      |
| CaptureSignals      | Screen / Tab Capture | Data Handling      |

**Governance (3):**

| Factor name          | Label (UI)          | Category        |
|----------------------|---------------------|-----------------|
| ToSViolations        | Policy Violations   | Rules & Policies|
| Consistency          | Behavior Match      | Rules & Policies|
| DisclosureAlignment  | Disclosure Accuracy  | Rules & Policies|

Severity bands in the UI: **Clear** (&lt;0.05), **Low risk** (0.05–0.4), **Medium risk** (0.4–0.7), **High risk** (≥0.7). The “animations bar” is the circular gauge and the per-factor gauge bars in the Risk Breakdown section.

---

## 11. CRXplorer Comparison (Summary)

- **Why scores can differ (e.g. ExtensionShield 75 vs CRXplorer 53):**
  - **CSP:** We fold it into Manifest (10%); they show it as a critical standalone category.  
  - **Content scripts / MAIN world:** They call out “MAIN world content script injection” as critical; we capture related risk mainly via SAST and gates, not a dedicated factor.  
  - **Web Accessible Resources / Externally Connectable:** They show these as separate categories; we use them in gates and reporting but not as dedicated scoring factors.  
  - **Permission and category breakdown:** Different weighting and grouping (e.g. Permissions 70% vs our PermissionsBaseline + PermissionCombos).

- **Factors we have that align with “benchmark” quality:**
  - SAST, VirusTotal, Obfuscation, Manifest (incl. CSP), ChromeStats, Webstore, Maintenance.  
  - PermissionsBaseline, PermissionCombos, NetworkExfil, CaptureSignals.  
  - ToSViolations, Consistency, DisclosureAlignment.  
  - Hard gates (VT, CRITICAL_SAST, TOS, PURPOSE_MISMATCH, SENSITIVE_EXFIL) and gate penalties.

- **Possible improvements for API/data benchmark alignment:**
  - Give CSP more weight (e.g. standalone factor or higher severity in Manifest).  
  - Add explicit **MAIN world** content script detection and score it.  
  - Add **Web Accessible Resources** and **Externally Connectable** as optional scoring factors.

---

## 12. File Reference

| Purpose              | Path |
|----------------------|------|
| Weights (v1)         | `src/extension_shield/scoring/weights.py` |
| Normalizers (per-factor formulas) | `src/extension_shield/scoring/normalizers.py` |
| Engine (layer + overall score, gates, decision) | `src/extension_shield/scoring/engine.py` |
| Hard gates           | `src/extension_shield/scoring/gates.py` |
| Models (FactorScore, LayerScore, etc.) | `src/extension_shield/scoring/models.py` |
| UI factor labels & categories | `frontend/src/components/report/LayerModal.jsx` |

---

*Last updated to reflect ScoringEngine v2.0.0 and weight preset v1.*
