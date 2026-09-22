# NMS Courier

A planned Windows desktop application for local runtime delivery in No Man's Sky.

**Status: desktop foundation in progress. No runtime bridge, game integration, or save editor has been implemented.**

The application will use Electron, React, TypeScript, and standard shadcn/ui components. Delivery will use verified game functions through local IPC and a Windows Named Pipe, without save editing as its delivery mechanism.

The distribution target is plug and play: acquire the complete application, extract or install it, and open it. Private runtimes and required tools will ship with the application. End users will not need Python, Node.js, package managers, or development tools. This is a release requirement, not a capability already demonstrated.

A dedicated **Save Editor** is planned for later, with isolated editing sessions, backups, comparisons, validation, and recovery.

## Documentation

Start with [the project plan](docs/PROJECT_PLAN.md).

| Document | Purpose |
| --- | --- |
| [Architecture and stack](docs/ARCHITECTURE.md) | Technologies, process boundaries, service responsibilities |
| [Repository structure](docs/REPOSITORY_STRUCTURE.md) | Planned folders, files, naming, ownership |
| [Self-contained distribution](docs/DISTRIBUTION.md) | Private Python, native dependencies, packaging, clean-machine acceptance |
| [Protocol and runtime](docs/PROTOCOL_AND_RUNTIME.md) | Sessions, commands, capabilities, game integration |
| [Product and UI](docs/PRODUCT_AND_UI.md) | Screens, journeys, standard shadcn composition |
| [Data and catalog](docs/DATA_AND_CATALOG.md) | SQLite, extraction, images, library |
| [Implementation and validation](docs/IMPLEMENTATION_AND_VALIDATION.md) | Work packages, checks, acceptance criteria |
| [Future Save Editor](docs/SAVE_EDITOR.md) | Separate scope and roadmap |
| [Research and decisions](docs/RESEARCH_AND_DECISIONS.md) | Evidence, sources, decisions, unresolved questions |

All repository documentation and new source comments will be in English. User-facing translations belong in dedicated locale resources.

Original code is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE). It permits use, modification, and redistribution for noncommercial purposes while prohibiting commercial use, sale, and charging for the software. Review third-party licenses and redistribution requirements before incorporation and release. Game assets will be read from the user's installation, not distributed in this repository.
