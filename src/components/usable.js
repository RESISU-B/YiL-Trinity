/*
 * hand-interactor — put on each hand. Sphere-overlap test against .interactable:
 *                   hover highlight, GRIP grabs (reparent to hand), TRIGGER
 *                   fires "used" on the hovered/held object.
 * usable          — put on any object the player can "use"; receives "used"
 *                   from hand trigger (VR) or mouse click (desktop).
 * damage-flash    — camera-attached plane; flashes red + haptics on player-hit.
 */

AFRAME.registerComponent('hand-interactor', {
  schema: { radius: { default: 0.12 } },

  init: function () {
    this.hovered = null;
    this.held = null;
    this.handPos = new THREE.Vector3();
    this.objPos = new THREE.Vector3();

    this.el.addEventListener('gripdown', () => this.grab());
    this.el.addEventListener('gripup', () => this.release());
    this.el.addEventListener('triggerdown', () => {
      const target = this.held || this.hovered;
      if (target && target.components.usable) target.components.usable.use();
    });
  },

  tick: function () {
    if (this.held) return;
    this.el.object3D.getWorldPosition(this.handPos);
    let closest = null;
    let closestDist = this.data.radius + 0.15; // grab reach
    document.querySelectorAll('.interactable').forEach((obj) => {
      obj.object3D.getWorldPosition(this.objPos);
      const d = this.handPos.distanceTo(this.objPos);
      if (d < closestDist) { closest = obj; closestDist = d; }
    });
    if (closest !== this.hovered) {
      if (this.hovered) this.hovered.emit('hover-end');
      if (closest) closest.emit('hover-start');
      this.hovered = closest;
    }
  },

  grab: function () {
    if (!this.hovered || !this.hovered.hasAttribute('grabbable')) return;
    this.held = this.hovered;
    this.held.object3D.getWorldPosition(this.objPos);
    this.el.object3D.attach(this.held.object3D); // keep world transform
    this.held.emit('grab-start');
  },

  release: function () {
    if (!this.held) return;
    this.el.sceneEl.object3D.attach(this.held.object3D); // drop in place
    this.held.emit('grab-end');
    this.held = null;
  }
});

/* Highlight feedback for anything interactable. */
if (AFRAME.components['hoverable']) delete AFRAME.components['hoverable'];
if (AFRAME.components['grabbable']) delete AFRAME.components['grabbable'];
AFRAME.registerComponent('hoverable', {
  init: function () {
    this.el.addEventListener('hover-start', () => {
      this.el.setAttribute('material', 'emissive', '#444400');
    });
    this.el.addEventListener('hover-end', () => {
      this.el.setAttribute('material', 'emissive', '#000000');
    });
  }
});

AFRAME.registerComponent('grabbable', {}); // marker component

AFRAME.registerComponent('usable', {
  init: function () {
    // desktop cursor
    this.el.addEventListener('click', () => this.use());
  },
  use: function () {
    this.el.emit('used');
  }
});

AFRAME.registerComponent('damage-flash', {
  init: function () {
    this.el.sceneEl.addEventListener('player-hit', (e) => {
      this.el.setAttribute('material', 'opacity', 0.5);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.el.setAttribute('material', 'opacity', 0);
      }, 250);
      // haptics if controllers are connected
      ['#handL', '#handR'].forEach((sel) => {
        const hand = document.querySelector(sel);
        const tc = hand && hand.components['tracked-controls'];
        const gp = tc && tc.controller && tc.controller.gamepad;
        if (gp && gp.hapticActuators && gp.hapticActuators[0]) {
          gp.hapticActuators[0].pulse(0.7, 150);
        }
      });
      console.log('player-hit:', e.detail.part);
    });
  }
});
