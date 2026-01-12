# Von Neumann Explorer

A browser-based incremental/strategy game about exponential growth through self-replicating space probes.

## Concept

Start with a single seed ship (Von Neumann Probe) and explore a procedural solar system. Scan planets, mine resources, and replicate until the galaxy is fully charted.

## Play

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Controls

| Key | Action |
|-----|--------|
| **Click** | Select unit / Move probe |
| **Tab** | Cycle through units |
| **Space** | Scan area |
| **A** | Toggle autonomous mode |
| **P** | Build new probe |
| **R** | Build rover |
| **M** | Merge 3 probes into station |
| **T** | Research new system (station only) |
| **Scroll** | Zoom in/out |
| **Middle-click + drag** | Pan view |

## Game Loop

1. **Scan** - Probes reveal hidden planets in fog of war
2. **Travel** - Move to discovered planets
3. **Mine** - Extract matter from planets (probes lock onto planets until full)
4. **Deposit** - Return matter to stations for storage
5. **Build** - Create new probes (50 matter) or rovers (25 matter)
6. **Expand** - Merge 3 probes into a station, research new solar systems

## Units

### Probe
- Triangle shape
- Can scan, mine, move, and self-replicate
- Toggle between manual and autonomous modes
- Cost: 50 matter

### Rover
- Square shape
- Autonomous scanning unit
- Cost: 25 matter (15 from station)

### Space Station
- Hexagon shape
- Created by merging 3 probes
- Higher storage capacity (500 matter)
- Builds units cheaper and faster
- Can research new solar systems (500 matter)

## Tech Stack

- **PixiJS** - 2D WebGL rendering
- **Miniplex** - Entity Component System
- **Vite** - Build tool and dev server
- **Vanilla JS** - ES Modules

## Architecture

```
src/
├── ecs/
│   ├── components.js    # ECS component definitions
│   ├── world.js         # Miniplex world and queries
│   └── systems/         # Game systems (AI, mining, orbital, etc.)
├── rendering/           # PixiJS graphics factories
├── systems/             # Input and camera systems
├── utils/               # Name generator
└── main.js              # Entry point and game loop
```

## License

MIT
