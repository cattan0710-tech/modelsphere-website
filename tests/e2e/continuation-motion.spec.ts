import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`continuation highlights 1→2→3→4 without shifting at ${width}px in ${colorScheme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme, reducedMotion: 'no-preference' });
      await page.goto('/');
      const steps = page.locator('.continuation-steps');
      await expect(steps).toHaveAttribute('data-continuation-running', 'false');
      await steps.scrollIntoViewIfNeeded();
      await expect(steps).toHaveAttribute('data-continuation-running', 'true');
      await expect(steps.locator('.continuation-step').first()).toHaveCSS(
        'animation-play-state',
        'running',
      );
      await expect
        .poll(() =>
          steps
            .locator('.continuation-step')
            .first()
            .evaluate((element) =>
              Number(element.getAnimations()[0].currentTime),
            ),
        )
        .toBeGreaterThan(100);

      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: 'instant' }),
      );
      await expect(steps).toHaveAttribute('data-continuation-running', 'false');
      await expect(steps.locator('.continuation-step').first()).toHaveCSS(
        'animation-play-state',
        'paused',
      );
      await steps
        .locator('.continuation-step')
        .first()
        .evaluate(async (element) => {
          await element.getAnimations()[0].ready;
        });
      const pausedAt = await steps
        .locator('.continuation-step')
        .first()
        .evaluate((element) => element.getAnimations()[0].currentTime);
      await page.waitForTimeout(120);
      const stillPausedAt = await steps
        .locator('.continuation-step')
        .first()
        .evaluate((element) => element.getAnimations()[0].currentTime);
      expect(stillPausedAt).toBe(pausedAt);
      await steps.scrollIntoViewIfNeeded();
      await expect(steps).toHaveAttribute('data-continuation-running', 'true');
      await expect(steps.locator('.continuation-step').first()).toHaveCSS(
        'animation-play-state',
        'running',
      );

      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', {
          configurable: true,
          value: true,
        });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await expect(steps).toHaveAttribute('data-continuation-running', 'false');
      await page.evaluate(() => {
        Reflect.deleteProperty(document, 'hidden');
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await expect(steps).toHaveAttribute('data-continuation-running', 'true');

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(steps).not.toHaveAttribute('data-continuation-motion');
      await expect(steps.locator('.continuation-step').first()).toHaveCSS(
        'animation-name',
        'none',
      );
      await expect(steps.locator('.continuation-step-3')).toHaveCSS(
        'border-top-color',
        await steps
          .locator('.continuation-step-3')
          .evaluate((element) => getComputedStyle(element).color),
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await expect(steps).toHaveAttribute('data-continuation-running', 'true');
      const samples = await steps.evaluate((element) => {
        const cards = Array.from(
          element.querySelectorAll('.continuation-step'),
        );
        const bounds = cards.map((card) =>
          card.getBoundingClientRect().toJSON(),
        );
        // Production CSS shortens keyframe names; select by the animated element.
        const animations = cards.flatMap((card) => [
          ...card.getAnimations(),
          ...card.querySelector('.continuation-step-number')!.getAnimations(),
          ...card
            .querySelector('.continuation-signal > .animate-ping')!
            .getAnimations(),
        ]);
        animations.forEach((animation) => animation.pause());
        const frames = [800, 4800, 8800, 12800, 16800].map((time) => {
          animations.forEach((animation) => {
            animation.currentTime = time;
          });
          return cards.map((card) => ({
            border: getComputedStyle(card).borderTopColor,
            number: getComputedStyle(
              card.querySelector('.continuation-step-number')!,
            ).backgroundColor,
            dotOpacity: Number(
              getComputedStyle(
                card.querySelector('.continuation-signal > .animate-ping')!,
              ).opacity,
            ),
            bounds: card.getBoundingClientRect().toJSON(),
          }));
        });
        return { frames, bounds, animationCount: animations.length };
      });
      expect(samples.animationCount).toBe(12);
      for (let index = 0; index < samples.frames.length; index++) {
        const active = index % 4;
        const frame = samples.frames[index];
        expect(frame[active].border).toBe(frame[active].number);
        const idleBorders = frame
          .filter((_, card) => card !== active)
          .map((card) => card.border);
        expect(new Set(idleBorders).size).toBe(1);
        expect(frame[active].border).not.toBe(idleBorders[0]);
        expect(frame[active].dotOpacity).toBeGreaterThan(0);
        expect(
          frame
            .filter((_, card) => card !== active)
            .map((card) => card.dotOpacity),
        ).toEqual([0, 0, 0]);
        expect(frame.map((card) => card.bounds)).toEqual(samples.bounds);
      }
    });
  }
}
