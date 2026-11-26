import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const { resolveRouteSeo } = await import('../src/lib/seo.js');
const {
  PROGRESSIVE_COMMISSION_SCHEDULE,
  calculateProgressiveCommission,
  isWorldLeoVerified,
} = await import('../src/lib/commissions.js');

const ROOT = process.cwd();

function collectFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectFiles(full));
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

test('2.2 SEO route metadata resolves cleanly for WorldLeo Home, Auto, FixSoon & Request routes', () => {
  const ctx = { categories: [], subcategories: [], locations: [], providers: [] };

  const home = resolveRouteSeo('/', ctx);
  assert.equal(home.title, 'WorldLeo — Your Home. Your Vehicle. One Trusted Place for Help.');
  assert.equal(home.canonicalPath, '/');

  const homeRepairs = resolveRouteSeo('/home/repairs', ctx);
  assert.match(homeRepairs.title, /WorldLeo Home/);
  assert.equal(homeRepairs.canonicalPath, '/home/repairs');

  const homeRenovations = resolveRouteSeo('/home/renovations', ctx);
  assert.match(homeRenovations.title, /WorldLeo Home/);
  assert.equal(homeRenovations.canonicalPath, '/home/renovations');

  const aiDesign = resolveRouteSeo('/home/ai-design', ctx);
  assert.match(aiDesign.title, /AI Design Studio/);

  const auto = resolveRouteSeo('/auto', ctx);
  assert.match(auto.title, /WorldLeo Auto/);

  const fixsoon = resolveRouteSeo('/auto/fixsoon', ctx);
  assert.match(fixsoon.title, /FixSoon by WorldLeo Auto/);

  const reqService = resolveRouteSeo('/request-service', ctx);
  assert.equal(reqService.canonicalPath, '/request-service');
  assert.match(reqService.title, /WorldLeo/);

  const reqLegacyAlias = resolveRouteSeo('/request', ctx);
  assert.equal(reqLegacyAlias.canonicalPath, '/request-service');

  const dashboard = resolveRouteSeo('/dashboard', ctx);
  assert.equal(dashboard.noIndex, true);
});

test('2.2 WorldLeo Verified badge strictly requires business_verified, insurance_verified, and profile_reviewed', () => {
  assert.equal(
    isWorldLeoVerified({
      email_verified: true,
      phone_verified: true,
      business_verified: true,
      license_verified: true,
      insurance_verified: true,
      profile_reviewed: true,
    }),
    true
  );

  assert.equal(
    isWorldLeoVerified({
      email_verified: true,
      phone_verified: true,
      business_verified: false,
      license_verified: true,
      insurance_verified: true,
      profile_reviewed: true,
    }),
    false
  );

  assert.equal(
    isWorldLeoVerified({
      email_verified: true,
      phone_verified: true,
      business_verified: true,
      license_verified: true,
      insurance_verified: false,
      profile_reviewed: true,
    }),
    false
  );

  assert.equal(
    isWorldLeoVerified({
      email_verified: true,
      phone_verified: true,
      business_verified: true,
      license_verified: true,
      insurance_verified: true,
      profile_reviewed: false,
    }),
    false
  );

  assert.equal(isWorldLeoVerified(undefined), false);
});

test('2.2 Progressive commission schedule evaluates all 5 volume tiers accurately', () => {
  assert.equal(PROGRESSIVE_COMMISSION_SCHEDULE.length, 5);

  const t1 = calculateProgressiveCommission(500);
  assert.equal(t1.effectiveRatePercent, 25);
  assert.equal(t1.platformFeeCad, 125);
  assert.equal(t1.providerPayoutCad, 375);

  const t2 = calculateProgressiveCommission(2000);
  assert.equal(t2.effectiveRatePercent, 15);
  assert.equal(t2.platformFeeCad, 300);
  assert.equal(t2.providerPayoutCad, 1700);

  const t3 = calculateProgressiveCommission(10000);
  assert.equal(t3.effectiveRatePercent, 10);
  assert.equal(t3.platformFeeCad, 1000);
  assert.equal(t3.providerPayoutCad, 9000);

  const t4 = calculateProgressiveCommission(20000);
  assert.equal(t4.effectiveRatePercent, 5);
  assert.equal(t4.platformFeeCad, 1000);
  assert.equal(t4.providerPayoutCad, 19000);

  const t5 = calculateProgressiveCommission(60000);
  assert.equal(t5.effectiveRatePercent, 2.5);
  assert.equal(t5.platformFeeCad, 1500);
  assert.equal(t5.providerPayoutCad, 58500);

  const t0 = calculateProgressiveCommission(-10);
  assert.equal(t0.platformFeeCad, 0);
  assert.equal(t0.providerPayoutCad, 0);
});

test('2.2 Approved WorldLeo Brand Identity assets and palette tokens are present with zero legacy palette hexes', () => {
  const iconSvg = fs.readFileSync(path.join(ROOT, 'public/icon.svg'), 'utf-8');
  assert.match(iconSvg, /#063B2B/i);
  assert.match(iconSvg, /#C6A45B/i);
  assert.match(iconSvg, /#F6F2E8/i);
  assert.match(iconSvg, /<path/i);

  const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
  assert.match(indexHtml, /#063B2B/i);
  assert.match(indexHtml, /WorldLeo — Your Home\. Your Vehicle\. One Trusted Place for Help\./);

  const css = fs.readFileSync(path.join(ROOT, 'src/index.css'), 'utf-8');
  assert.match(css, /--wl-green-deep:\s*#063B2B/i);
  assert.match(css, /--wl-green-forest:\s*#071E17/i);
  assert.match(css, /--wl-gold:\s*#C6A45B/i);
  assert.match(css, /--wl-ivory:\s*#F6F2E8/i);

  const sourceFiles = [
    ...collectFiles(path.join(ROOT, 'src/components')),
    ...collectFiles(path.join(ROOT, 'src/pages')),
  ];
  const forbiddenHex = /#(?:0F172A|F59E0B|B45309|F8FAFC|0D0F12|D8B45A|A87919|E2E8F0|1E293B|111827|090D16|171A1F|D8D4CA|ECE9E0)\b/i;

  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    assert.equal(
      forbiddenHex.test(content),
      false,
      `Legacy palette hex code found in ${path.relative(ROOT, file)}`
    );
  }
});
