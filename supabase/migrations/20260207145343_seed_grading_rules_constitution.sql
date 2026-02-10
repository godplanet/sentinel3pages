/*
  # Seed KERD-2026 Grading Constitution

  Updates the active methodology config with the full parametric grading ruleset:

  1. Deductions
    - Critical finding: -25 points each
    - High finding: -10 points each
    - Medium finding: -3 points each
    - Low finding: -1 point each

  2. Capping Rules
    - 1+ Critical findings caps score at 60 (D grade maximum)
    - 3+ High findings caps score at 69 (C- grade maximum)

  3. Grading Scale (A+ to F)
    - A+ (95-100): Tam Guvence
    - A  (90-94): Tam Guvence
    - B+ (85-89): Makul Guvence
    - B  (80-84): Makul Guvence
    - C+ (75-79): Makul Guvence
    - C  (70-74): Sinirli Guvence
    - C- (65-69): Sinirli Guvence
    - D  (50-64): Sinirli Guvence
    - E  (25-49): Guvence Yok
    - F  (0-24): Guvence Yok
*/

UPDATE methodology_configs
SET
  grading_rules = '{
    "deductions": {
      "critical": 25,
      "high": 10,
      "medium": 3,
      "low": 1
    },
    "capping": [
      {
        "condition": "count_critical >= 1",
        "field": "count_critical",
        "operator": ">=",
        "value": 1,
        "max_score": 60,
        "reason": "Kritik bulgu mevcut - Maksimum not D"
      },
      {
        "condition": "count_high > 3",
        "field": "count_high",
        "operator": ">",
        "value": 3,
        "max_score": 69,
        "reason": "3+ Yuksek bulgu - Maksimum not C-"
      }
    ],
    "scale": [
      { "grade": "A+", "min": 95, "max": 100, "opinion": "TAM_GUVENCE", "label": "Tam Guvence" },
      { "grade": "A",  "min": 90, "max": 94,  "opinion": "TAM_GUVENCE", "label": "Tam Guvence" },
      { "grade": "B+", "min": 85, "max": 89,  "opinion": "MAKUL_GUVENCE", "label": "Makul Guvence" },
      { "grade": "B",  "min": 80, "max": 84,  "opinion": "MAKUL_GUVENCE", "label": "Makul Guvence" },
      { "grade": "C+", "min": 75, "max": 79,  "opinion": "MAKUL_GUVENCE", "label": "Makul Guvence" },
      { "grade": "C",  "min": 70, "max": 74,  "opinion": "SINIRLI_GUVENCE", "label": "Sinirli Guvence" },
      { "grade": "C-", "min": 65, "max": 69,  "opinion": "SINIRLI_GUVENCE", "label": "Sinirli Guvence" },
      { "grade": "D",  "min": 50, "max": 64,  "opinion": "SINIRLI_GUVENCE", "label": "Sinirli Guvence" },
      { "grade": "E",  "min": 25, "max": 49,  "opinion": "GUVENCE_YOK", "label": "Guvence Yok" },
      { "grade": "F",  "min": 0,  "max": 24,  "opinion": "GUVENCE_YOK", "label": "Guvence Yok" }
    ]
  }'::jsonb,
  updated_at = now()
WHERE is_active = true;
