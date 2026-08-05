/*
 * simple-gravity — put on the player rig. Raycasts straight down against
 * everything with class="walkable": snaps to ground (handles ramps/steps
 * up to 0.45m), otherwise falls with gravity.
 * Emits on the rig: "fall-start" when leaving a surface,
 *                   "player-landed" {distance} after a fall > 2m.
 */
AFRAME.registerComponent('simple-gravity', {
  init: function () {
    this.vel = 0;
    this.falling = false;
    this.fallStartY = 0;
    this.ray = new THREE.Raycaster();
    this.ray.far = 80;
    this.down = new THREE.Vector3(0, -1, 0);
    this.origin = new THREE.Vector3();
    this.walkables = [];
    const refresh = () => {
      this.walkables = Array.from(document.querySelectorAll('.walkable'))
        .map((el) => el.object3D);
    };
    this.el.sceneEl.addEventListener('loaded', refresh);
    setInterval(refresh, 2000);
  },

  tick: function (t, dtMs) {
    if (!this.walkables.length) return;
    const dt = Math.min(dtMs / 1000, 0.1);
    const pos = this.el.object3D.position;
    this.origin.set(pos.x, pos.y + 1.2, pos.z);
    this.ray.set(this.origin, this.down);
    const hits = this.ray.intersectObjects(this.walkables, true);
    const groundY = hits.length ? this.origin.y - hits[0].distance : -60;
    const dy = pos.y - groundY; // + means feet above ground

    if (dy <= 0.45) {
      // grounded (also steps up ramps/ledges)
      if (this.falling) {
        const dist = this.fallStartY - groundY;
        this.falling = false;
        this.vel = 0;
        if (dist > 2) this.el.emit('player-landed', { distance: dist });
      }
      pos.y = groundY;
    } else {
      if (!this.falling) {
        this.falling = true;
        this.fallStartY = pos.y;
        this.el.emit('fall-start', { groundY: groundY });
      }
      this.vel += 9.8 * dt;
      pos.y = Math.max(groundY, pos.y - this.vel * dt);
    }
  }
});
