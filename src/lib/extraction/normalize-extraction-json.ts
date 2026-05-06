/**
 * Repariert typische Lücken / Typfehler in KI-JSON **vor** der strikten Zod-Validierung.
 * Ziel: kein Totalabsturz, wenn einzelne Unterobjekte fehlen oder `source` fehlt.
 */

const emptySource = () =>
  ({ page: null, para: null, quote: null }) as Record<string, unknown>;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function sanitizeSource(s: unknown): Record<string, unknown> {
  if (!isPlainObject(s)) return emptySource();
  return { ...emptySource(), ...s };
}

function toNullableString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") return v;
  return String(v);
}

/** Normalisiert das Modell-JSON für `voBolzDirektzusageV1Schema`. */
export function normalizeAnthropicBolzJson(raw: unknown): unknown {
  if (!isPlainObject(raw)) return raw;

  const o = raw;

  if (!isPlainObject(o.metadata)) {
    o.metadata = { documentName: "", documentDate: null };
  } else {
    const md = o.metadata as Record<string, unknown>;
    if (typeof md.documentName !== "string")
      md.documentName = String(md.documentName ?? "");
  }

  if (!isPlainObject(o.scheme)) {
    o.scheme = {
      type: "BoLZ",
      implementation: "Direktzusage",
      openForNewEntries: null,
      closingDate: null,
    };
  } else {
    const sc = o.scheme as Record<string, unknown>;
    sc.type = "BoLZ";
    sc.implementation = "Direktzusage";
    sc.closingDate = toNullableString(sc.closingDate);
  }

  if (!isPlainObject(o.eligibility)) {
    o.eligibility = {
      minAge: { value: null, source: emptySource() },
      waitingPeriod: { months: null, source: emptySource() },
      excludedGroups: [],
    };
  } else {
    const el = o.eligibility as Record<string, unknown>;
    if (!isPlainObject(el.minAge)) {
      el.minAge = { value: null, source: emptySource() };
    } else {
      const m = el.minAge as Record<string, unknown>;
      m.source = sanitizeSource(m.source);
    }
    if (!isPlainObject(el.waitingPeriod)) {
      el.waitingPeriod = { months: null, source: emptySource() };
    } else {
      const w = el.waitingPeriod as Record<string, unknown>;
      w.source = sanitizeSource(w.source);
    }
    if (!Array.isArray(el.excludedGroups)) el.excludedGroups = [];
  }

  const defEmp = {
    type: null,
    rate: null,
    base: null,
    salaryDefinition: null,
    salaryCap: null,
    source: emptySource(),
  };
  const defEmp2 = { type: null, maxRate: null, source: emptySource() };

  if (!isPlainObject(o.contributions)) {
    o.contributions = {
      employerContribution: { ...defEmp },
      employeeContribution: { ...defEmp2 },
    };
  } else {
    const c = o.contributions as Record<string, unknown>;
    if (!isPlainObject(c.employerContribution)) {
      c.employerContribution = { ...defEmp };
    } else {
      const e = { ...defEmp, ...c.employerContribution } as Record<string, unknown>;
      e.source = sanitizeSource(e.source);
      c.employerContribution = e;
    }
    if (!isPlainObject(c.employeeContribution)) {
      c.employeeContribution = { ...defEmp2 };
    } else {
      const e = { ...defEmp2, ...c.employeeContribution } as Record<string, unknown>;
      e.source = sanitizeSource(e.source);
      c.employeeContribution = e;
    }
  }

  const defVest = {
    rule: null,
    minServiceYears: null,
    minAge: null,
    source: emptySource(),
  };
  if (!isPlainObject(o.vesting)) {
    o.vesting = { ...defVest };
  } else {
    const v = { ...defVest, ...o.vesting } as Record<string, unknown>;
    v.source = sanitizeSource(v.source);
    o.vesting = v;
  }

  const defOld = {
    regularRetirementAge: null,
    earlyRetirementReductionPerMonth: null,
    formula: null,
    guaranteedInterest: null,
    source: emptySource(),
  };
  const defDis = {
    qualifying: null,
    formula: null,
    source: emptySource(),
  };
  const defSp = { rate: null, remarriage: null, source: emptySource() };
  const defOr = {
    halfOrphan: null,
    fullOrphan: null,
    maxAge: null,
    source: emptySource(),
  };
  const defDeath = { spouse: { ...defSp }, orphan: { ...defOr } };

  if (!isPlainObject(o.benefits)) {
    o.benefits = {
      oldAge: { ...defOld },
      disability: { ...defDis },
      death: { ...defDeath },
    };
  } else {
    const b = o.benefits as Record<string, unknown>;
    if (!isPlainObject(b.oldAge)) {
      b.oldAge = { ...defOld };
    } else {
      const x = { ...defOld, ...b.oldAge } as Record<string, unknown>;
      x.source = sanitizeSource(x.source);
      b.oldAge = x;
    }
    if (!isPlainObject(b.disability)) {
      b.disability = { ...defDis };
    } else {
      const x = { ...defDis, ...b.disability } as Record<string, unknown>;
      x.source = sanitizeSource(x.source);
      b.disability = x;
    }
    if (!isPlainObject(b.death)) {
      b.death = { ...defDeath };
    } else {
      const d = { ...defDeath, ...b.death } as Record<string, unknown>;
      if (!isPlainObject(d.spouse)) d.spouse = { ...defSp };
      else {
        const s = { ...defSp, ...d.spouse } as Record<string, unknown>;
        s.source = sanitizeSource(s.source);
        d.spouse = s;
      }
      if (!isPlainObject(d.orphan)) d.orphan = { ...defOr };
      else {
        const or = { ...defOr, ...d.orphan } as Record<string, unknown>;
        or.source = sanitizeSource(or.source);
        d.orphan = or;
      }
      b.death = d;
    }
  }

  const defAdj = { rule: null, method: null, source: emptySource() };
  if (!isPlainObject(o.adjustment)) {
    o.adjustment = { ...defAdj };
  } else {
    const a = { ...defAdj, ...o.adjustment } as Record<string, unknown>;
    a.source = sanitizeSource(a.source);
    o.adjustment = a;
  }

  if (!Array.isArray(o.openQuestions)) o.openQuestions = [];

  return o;
}
