/*
 * hazard-fall — put on <a-scene>. Fall-protection scenario on the scaffold.
 * Anchor the harness (#anchor) -> crossing the plank is safe (rope catch).
 * Fall unanchored -> dramatic drop, strike, respawn at the ramp base.
 * Reach the flag platform while anchored -> objective 0 complete.
 */
AFRAME.registerComponent('hazard-fall', {
  init: function () {
    const scene = this.el;
    this.rig = document.querySelector('#rig');
    this.done = false;

    const anchor = document.querySelector('#anchor');
    anchor.addEventListener('used', () => {
      if (GAME.anchored) return;
      GAME.anchored = true;
      anchor.setAttribute('color', '#2ecc71');
      scene.emit('toast', { text: 'Harness anchored. You are now protected at height.' });
      scene.emit('hud-update');
    });

    this.rig.addEventListener('fall-start', () => {
      const p = this.rig.object3D.position;
      const fromScaffold = p.z < -9 && p.z > -25 && p.y > 2;
      if (!fromScaffold || !GAME.anchored) return;
      // rope catch: brief drop, then hauled back onto the platform
      setTimeout(() => {
        this.rig.setAttribute('position', '0 6.06 -14');
        scene.emit('toast', { text: 'Your lanyard caught you! That anchor just saved your life.' });
      }, 350);
    });

    this.rig.addEventListener('player-landed', (e) => {
      const p = this.rig.object3D.position;
      if (p.z < -9 && p.z > -26 && e.detail.distance > 2 && !GAME.anchored) {
        scene.emit('fail', {
          text: 'You fell from the scaffold with NO harness. At this height that is fatal.',
          respawn: '0 6.1 -12.5'
        });
      }
    });
  },

  tick: function () {
    if (this.done) return;
    const p = this.rig.object3D.position;
    // flag platform: x [-1.5,1.5], z [-21,-23.5], up high
    if (GAME.anchored && p.y > 2.5 &&
        p.x > -1.5 && p.x < 1.5 && p.z < -21 && p.z > -23.5) {
      this.done = true;
      this.el.emit('objective-complete', {
        id: 0, text: 'Fall protection cleared — tied off and crossed safely!'
      });
    }
  }
});
