# YiL-Trinity — VR Construction Site Safety Training

2026 VR/XR workshop. WebXR walking simulator built with A-Frame (no game engine):
you play a construction worker doing tasks while avoiding site hazards.

## Stack

- [A-Frame 1.5](https://aframe.io) — scene, VR session, controllers
- [aframe-extras](https://github.com/c-frame/aframe-extras) — `movement-controls` (thumbstick / WASD locomotion)
- [aframe-aabb-collider](https://github.com/supermedium/aframe-aabb-collider-component) — player hitboxes vs hazards
- Custom components in `src/components/`:
  - `hand-interactor` — grip to grab, trigger to use, hover highlight
  - `player-hitboxes` — head / torso / feet boxes; contact with `.hazard` fires `player-hit`
  - `damage-flash` — red vignette + controller haptics on hit

## Run it

```
python -m http.server 8090
```

### Test on desktop

Open http://localhost:8090 in Chrome.

- **WASD** to walk, **drag mouse** to look
- **Click** the green lever → the lamp above it toggles (that's "use")
- Walk into the **red zone** → screen flashes red, `player-hit` logged in console
- Add `?debug` to the URL to see the player hitboxes (lime wireframes)

### Test on Quest

WebXR needs HTTPS *except* on localhost, so tunnel over USB:

1. Enable developer mode on the Quest, connect USB, allow debugging
2. `adb reverse tcp:8090 tcp:8090`
3. Open `http://localhost:8090` in the Quest browser → Enter VR
4. **Left stick** walks, **grip** grabs the orange crate, **trigger** on the green lever toggles the lamp, walking into the red zone flashes + vibrates

## Project layout

```
index.html                     scene, player rig, level markup
src/components/                reusable engine pieces (player, interaction)
src/game/tasks.js              linear objective system (stub)
src/game/hazards.js            hazard registry (stub)
src/game/hazards/              the 3 specific hazards go here
assets/                        GLB models, sounds
```

Convention: anything with `class="hazard"` hurts the player on contact;
anything with `class="interactable"` can be hovered/grabbed/used.

## Team

See [Team-Members](Team-Members).
