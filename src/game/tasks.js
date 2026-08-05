/*
 * game-manager — put on <a-scene>. Owns the shared game state, the HUD
 * overlay (laptop-friendly DOM), objectives, strikes, fails and respawns.
 *
 * Scene events:
 *   toast {text}                       — show a message
 *   fail  {text, respawn?}             — strike + red flash + optional respawn
 *   objective-complete {id, text?}     — hazard cleared (0,1,2)
 *   hud-update                         — re-render status line
 */
window.GAME = {
  anchored: false, breakerOff: false, tagged: false, shored: false,
  strikes: 0, stage: 0
};

AFRAME.registerComponent('game-manager', {
  init: function () {
    const hud = document.createElement('div');
    hud.style.cssText =
      'position:fixed;top:12px;left:12px;z-index:9999;font-family:Segoe UI,Arial,sans-serif;' +
      'color:#fff;background:rgba(0,0,0,.6);padding:12px 16px;border-radius:10px;' +
      'max-width:430px;line-height:1.45;font-size:15px;pointer-events:none';
    hud.innerHTML =
      '<div id="hud-obj" style="font-weight:600"></div>' +
      '<div id="hud-status" style="margin-top:6px;font-size:12.5px;color:#cfd8dc"></div>' +
      '<div id="hud-toast" style="margin-top:6px;color:#ffd54f;font-weight:600"></div>';
    document.body.appendChild(hud);

    this.objectives = [
      '1/3 FALL PROTECTION — Climb the scaffold ramp. USE the yellow anchor ring to clip your harness, then cross the plank to the green flag.',
      '2/3 LOCKOUT / TAGOUT — At the substation: shut off the BREAKER, hang the red TAG, and only then open the service panel.',
      '3/3 TRENCH SAFETY — USE the shoring stack to brace the trench walls, then climb down and close the red valve.',
      'ALL 3 HAZARDS CLEARED — SITE SAFE. Great work, stay safe out there!'
    ];
    this.completed = new Set();

    const scene = this.el;
    scene.addEventListener('toast', (e) => this.toast(e.detail.text));
    scene.addEventListener('hud-update', () => this.update());
    scene.addEventListener('fail', (e) => {
      GAME.strikes++;
      scene.emit('player-hit', { part: 'accident' });
      this.toast('⚠ ' + e.detail.text + '  (strike ' + GAME.strikes + ')');
      if (e.detail.respawn) {
        document.querySelector('#rig').setAttribute('position', e.detail.respawn);
      }
      this.update();
    });
    scene.addEventListener('objective-complete', (e) => {
      if (this.completed.has(e.detail.id)) return;
      this.completed.add(e.detail.id);
      while (this.completed.has(GAME.stage)) GAME.stage++;
      this.toast('✔ ' + (e.detail.text || 'Objective complete!'));
      this.update();
    });
    this.update();
  },

  toast: function (text) {
    const el = document.getElementById('hud-toast');
    el.textContent = text;
    clearTimeout(this.tt);
    this.tt = setTimeout(() => { el.textContent = ''; }, 6000);
  },

  update: function () {
    const obj = document.getElementById('hud-obj');
    obj.textContent = this.objectives[Math.min(GAME.stage, 3)];
    obj.style.color = GAME.stage >= 3 ? '#7CFC00' : '#fff';
    document.getElementById('hud-status').textContent =
      'Harness: ' + (GAME.anchored ? 'ANCHORED ✔' : 'not anchored') +
      '  |  Breaker: ' + (GAME.breakerOff ? 'OFF ✔' : 'LIVE') +
      '  |  Tag: ' + (GAME.tagged ? 'HUNG ✔' : '—') +
      '  |  Shoring: ' + (GAME.shored ? 'SET ✔' : 'none') +
      '  |  Strikes: ' + GAME.strikes;
  }
});
