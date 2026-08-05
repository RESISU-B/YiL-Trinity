/*
 * hazard-loto — put on <a-scene>. Lockout/Tagout at the substation.
 * Correct order: breaker OFF -> hang tag -> open service panel.
 * Panel while LIVE  -> machine revs, sparks, injury, strike.
 * Panel without tag -> "coworker re-energizes it", strike.
 */
AFRAME.registerComponent('hazard-loto', {
  init: function () {
    const scene = this.el;
    const breaker = document.querySelector('#breaker');
    const hook = document.querySelector('#tag-hook');
    const tag = document.querySelector('#tag');
    const panel = document.querySelector('#service-panel');
    const gear = document.querySelector('#gear');
    const sparks = document.querySelector('#sparks');
    this.done = false;

    const SPIN = 'property: rotation; to: 0 0 -360; loop: true; dur: 1600; easing: linear';
    const spin = (on, fast) => {
      gear.removeAttribute('animation');
      gear.setAttribute('rotation', '0 0 0');
      if (on) gear.setAttribute('animation', fast ? SPIN.replace('1600', '250') : SPIN);
    };
    spin(true);

    breaker.addEventListener('used', () => {
      if (this.done) return;
      GAME.breakerOff = !GAME.breakerOff;
      breaker.setAttribute('color', GAME.breakerOff ? '#2ecc71' : '#c0392b');
      spin(!GAME.breakerOff);
      scene.emit('toast', {
        text: GAME.breakerOff ? 'Breaker OFF — machine de-energized.'
                              : 'Breaker back ON — machine is LIVE.'
      });
      scene.emit('hud-update');
    });

    hook.addEventListener('used', () => {
      if (this.done || GAME.tagged) return;
      if (!GAME.breakerOff) {
        scene.emit('toast', { text: 'Shut off the breaker BEFORE tagging it.' });
        return;
      }
      GAME.tagged = true;
      tag.setAttribute('visible', true);
      scene.emit('toast', { text: 'Danger tag hung — nobody can legally re-energize this now.' });
      scene.emit('hud-update');
    });

    panel.addEventListener('used', () => {
      if (this.done) return;
      if (!GAME.breakerOff) {
        // hands into a live machine
        spin(true, true);
        sparks.setAttribute('visible', true);
        setTimeout(() => { sparks.setAttribute('visible', false); spin(true); }, 2000);
        scene.emit('fail', {
          text: 'The machine was LIVE — it activated with your hands inside. Always lock out first.'
        });
      } else if (!GAME.tagged) {
        // no tag: someone flips it back on
        GAME.breakerOff = false;
        breaker.setAttribute('color', '#c0392b');
        spin(true);
        sparks.setAttribute('visible', true);
        setTimeout(() => sparks.setAttribute('visible', false), 2000);
        scene.emit('fail', {
          text: 'No tag on the breaker — a coworker re-energized it while you were inside. Tag out!'
        });
        scene.emit('hud-update');
      } else {
        this.done = true;
        panel.setAttribute('color', '#1abc9c');
        this.el.emit('objective-complete', {
          id: 1, text: 'Lockout/Tagout done — machine serviced safely.'
        });
      }
    });
  }
});
