# Project: Von Neumann Explorer
**Type:** Browser-based Incremental/Strategy Game
**Vibe:** Scientific, Minimalist, Industrial, Peaceful
**Tech Stack:** PixiJS (Rendering), Miniplex (ECS), Vanilla JS (ES Modules)

## Core Concept
A peaceful exploration game about exponential growth. The player starts with a single seed ship (Von Neumann Probe) in a procedural galaxy. The goal is to explore, mine, and replicate until the system is fully charted.

## Game Loop
1. **Scan:** Probes detect Planets.
2.  **Travel:** Probes move to Planets.
3.  **Extract:**
    - Probes can deploy **Rovers** to planetary surfaces.
    - Rovers mine **Ore**.
4.  **Process:** Ore is converted into **Biomass/Polymer/Metal** (simplified to "Matter").
5.  **Replicate/Build:**
    - **Self-Replication:** A Probe uses Matter to 3D print another Probe.
    - **Construction:** 3 Probes can merge to form a **Space Station** (Shipyard).
    - **Space Station:** Acts as a resource hub and can build advanced units (faster Rovers, better Scanners).

## Entities & Rules

### The Probe (Unit)
- **Visual:** Small Triangle.
- **Capabilities:** Movement, Scanning (Fog of War removal), Simple Mining (slow), 3D Printing (Self).
- **Cost:** 100 Matter.

### The Rover (Sub-Unit)
- **Visual:** Small Square (only visible when zoomed into planet).
- **Capabilities:** High-speed Mining.
- **Constraint:** Must be deployed by a Probe or Station. Cannot leave the planet.

### The Space Station (Structure)
- **Visual:** Large Circle/Hexagon.
- **Creation Condition:** Requires 3 Probes to be at the same location + Command to "Merge".
- **Capabilities:** High storage capacity, faster unit production, resource hub.

### The Planet (Environment)
- **Visual:** Colored Circles (Color denotes ore type).
- **Attributes:** Total Resources, Radius.

## Systems (ECS Architecture)
- **MovementSystem:** Updates positions (velocity/acceleration).
- **MiningSystem:** Ticks resource counters based on Rover/Probe proximity to Planets.
- **ConstructionSystem:** Handles the "3D Print" timer and spawning new entities.
- **MergeSystem:** Detects if 3 Probes are selected/grouped to form a Station.
- **RenderingSystem:** Syncs PixiJS graphics with ECS data.

## Visual Style Guide
- **Background:** Deep dark blue/black.
- **UI:** HTML overlays. Clean, white thin fonts (monospace).
- **Graphics:** Vector shapes. No textures.
- **Feedback:** "Juice" comes from smooth interpolation and clean motion, not explosions.

## Current Objective
Initialize the project structure with a basic ECS loop and render the first "Seed Ship" in the center of the screen.
