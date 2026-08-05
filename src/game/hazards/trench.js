/*
 * hazard-trench — put on <a-scene>. Trench/excavation scenario.
 * USE the shoring stack -> braces appear in the trench, safe to enter.
 * Enter unshored -> walls cave in, strike, respawn topside.
 * Close the valve at the trench end (shored) -> objective 2 complete.
 */
AFRAME.registerComponent('hazard-trench', {
  init: function () {
    const scene = this.el;
    this.rig = document.querySelector('#rig');
    this.collapsed = false;
    this.done = false;

    const stack = document.querySelector('#shore-stack');
    stack.addEventListener('used', () => {
      if (GAME.shored) return;
      GAME.shored = true;
      document.querySelectorAll('.shore').forEach((s) => s.setAttribute('visible', true));
      stack.setAttribute('color', '#7f8c8d');
      scene.emit('toast', { text: 'Shoring set — trench walls are braced. Safe to enter.' });
      scene.emit('hud-update');
    });

    const valve = document.querySelector('#valve');
    valve.addEventListener('used', () => {
      if (this.done) return;
      if (!GAME.shored) {
        scene.emit('toast', { text: 'Brace the trench before working in it!' });
        return;
      }
      this.done = true;
      valve.setAttribute('animation', 'property: rotation; to: 0 0 720; dur: 1200');
      this.el.emit('objective-complete', {
        id: 2, text: 'Trench secured and valve closed — excavation work done safely.'
      });
    });
  },

  tick: function () {
    if (this.collapsed || GAME.shored) return;
    const p = this.rig.object3D.position;
    // inside the trench, below grade
    if (p.y < -0.8 && p.x > -2 && p.x < 2 && p.z < -52 && p.z > -58) {
      this.collapsed = true;
      const scene = this.el;
      const e = document.querySelector('#trench-wall-e');
      const w = document.querySelector('#trench-wall-w');
      e.setAttribute('animation', 'property: position; to: 0.7 -1 -55; dur: 500; easing: easeInQuad');
      w.setAttribute('animation', 'property: position; to: -0.7 -1 -55; dur: 500; easing: easeInQuad');
      setTimeout(() => {
        scene.emit('fail', {
          text: 'TRENCH COLLAPSE — an unshored trench can bury a worker in seconds.',
          respawn: '0 0 -48'
        });
        // reset the walls for another attempt
        setTimeout(() => {
          e.removeAttribute('animation');
          w.removeAttribute('animation');
          e.setAttribute('position', '2.15 -1 -55');
          w.setAttribute('position', '-2.15 -1 -55');
          this.collapsed = false;
        }, 1500);
      }, 600);
    }
  }
});
