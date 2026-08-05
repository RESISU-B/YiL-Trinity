/*
 * player-hitboxes — attach to the player rig.
 * Creates three invisible hitboxes (head / torso / feet) that watch for
 * anything with class="hazard". On contact, emits "player-hit" on the scene
 * with { part } so hazards/tasks can react. Add ?debug to the URL to see them.
 */
AFRAME.registerComponent('player-hitboxes', {
  init: function () {
    const debug = location.search.includes('debug');
    const scene = this.el.sceneEl;

    const makeBox = (part, parent, pos, size) => {
      const box = document.createElement('a-box');
      box.setAttribute('id', 'hitbox-' + part);
      box.setAttribute('position', pos);
      box.setAttribute('width', size[0]);
      box.setAttribute('height', size[1]);
      box.setAttribute('depth', size[2]);
      box.setAttribute('material',
        debug ? 'color: lime; wireframe: true' : 'transparent: true; opacity: 0');
      box.setAttribute('aabb-collider', 'objects: .hazard');
      box.addEventListener('hitstart', () => {
        scene.emit('player-hit', { part: part });
      });
      parent.appendChild(box);
    };

    // head follows the camera; torso and feet ride on the rig
    const head = this.el.querySelector('[camera]');
    makeBox('head', head, '0 0 0', [0.25, 0.3, 0.25]);
    makeBox('torso', this.el, '0 1.1 0', [0.4, 0.7, 0.25]);
    makeBox('feet', this.el, '0 0.15 0', [0.35, 0.3, 0.35]);
  }
});
