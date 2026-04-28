#!/usr/bin/env python3
"""Proof: every CSV row's (model, size, color) is uniquely determined by the
prefix of its Artikel Nummer up to the first '-NL-' or '-NE-' delimiter."""

import csv, re, sys, collections

NL_NE = re.compile(r'-N[LE]-')
path = sys.argv[1]

with open(path, encoding='utf-8') as f:
    r = csv.reader(f, delimiter=';')
    header = next(r)
    prefix_to_variants = collections.defaultdict(set)
    prefix_to_count = collections.Counter()
    unparseable = []

    for row in r:
        if len(row) < 3: continue
        artikel_nr = row[1].strip()
        bez = row[2].strip()
        aug2 = row[7].strip() if len(row) > 7 else ''
        aug3 = row[8].strip() if len(row) > 8 else ''
        if not NL_NE.search(artikel_nr):
            unparseable.append(f"{artikel_nr}  →  {bez}")
            continue
        prefix = NL_NE.split(artikel_nr, 1)[0].rstrip(' -')
        signature = f"{aug2 or '?'} | {aug3 or '?'} | {bez}"
        prefix_to_variants[prefix].add(signature)
        prefix_to_count[prefix] += 1

    collisions = {p: v for p, v in prefix_to_variants.items() if len(v) > 1}
    print(f"Total rows (parsed):        {sum(prefix_to_count.values())}")
    print(f"Unique prefixes:            {len(prefix_to_variants)}")
    print(f"Unparseable (no NL/NE):     {len(unparseable)}")
    print(f"Prefix→variant COLLISIONS:  {len(collisions)}")
    print()

    if collisions:
        print("=== COLLISIONS ===")
        for p, variants in sorted(collisions.items()):
            print(f"  {p}  ({prefix_to_count[p]}x)")
            for v in sorted(variants): print(f"    - {v}")
    else:
        print("*** Every prefix maps to exactly ONE variant — no fuzzy matching needed ***")

    print()
    print("=== Unparseable rows (parts, no NL-/NE- delimiter — filtered by existing rule) ===")
    for u in unparseable[:10]:
        print(f"  {u}")
    if len(unparseable) > 10:
        print(f"  ... and {len(unparseable)-10} more")

    print()
    print("=== Top 15 prefixes by stock count ===")
    for p, c in prefix_to_count.most_common(15):
        sig = list(prefix_to_variants[p])[0]
        print(f"  {c:3}x  {p:35}  {sig[:80]}")
