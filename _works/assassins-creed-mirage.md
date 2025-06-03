---
title: "Assassins Creed Mirage iOS"
date: 06-06-2024
type: main
category: game
category_slug: game
role: producer
external_url: https://www.ubisoft.com/en-us/game/assassins-creed/news/6hRBheSWDoKUdnKxzy5YOg/assassins-creed-mirage-is-coming-to-ios
image: assets/credits/assassins-creed-mirage-logo.png
---


Working on a game fully within Apple’s ecosystem was a dream I finally realized with the port of a full **Assassin’s Creed** game to iOS.

When I first joined Ubisoft, I was handed the **Anvil Mobile Team** — a small, ragtag group assembled to answer a single question:

> *Could the massive, console-class Anvil engine run on Apple devices using only Metal?*

There was no goal. No project. Very little support (the updates I provided on my team to the other Engine teams was often just a footnote in the bigger scheme of updates). Just a handful of us staring down an unknown future and a graphics stack designed entirely around **DirectX**. Apple doesn’t support DirectX or Vulkan at all — everything would have to run through **Metal**. That meant reworking the entire rendering pipeline, reimagining asset loading, and eventually rewriting parts of the engine itself.


The first year of the team’s life was pure R&D. Our own roadmap. No shipping goal. Just raw engine adaptation. We worked in complete ambiguity, grinding just to get the **basics rendering correctly on iOS and macOS**. Rendering was the beast of the problem.

For months, our test scene consisted of:

* A **tree**, standing in for a static mesh.
* A **chicken**, replacing the skeleton mesh used for rigged characters.

We saw that chicken *every single day*, and over time, it became our internal **mascot**, lovingly referenced in video updates and team memes.

This wasn't glamorous. Our early builds barely launched. I even once gave an entire 10 minute presentation on why a black screen was a momentus moment. 


The Anvil engine was tightly coupled to the assumptions of PC/console hardware and DirectX rendering. Apple’s GPUs operate differently using **tile-based deferred rendering**, meaning they render scenes in small tiles directly on-chip to conserve memory bandwidth. This made them **incredibly efficient**, but it also changed how we had to **manage memory, batch draw calls, and structure our rendering flow**.


Some of our other confronting architectural challenges included:

* **Shader Translation**: Our vast library of HLSL shaders had to be converted to **Metal Shading Language (MSL)**.
* **Resource Binding**: Descriptor sets and resource layouts required refactoring to conform to Metal’s expectations.
* **Asset Streaming**: Apple’s **unified memory** meant we needed fine-grained control over which resources were resident and when.


Getting rendering working was just one side of the problem. We also had to completely rethink our **build pipeline**.

The Anvil engine had never run on macOS, and many critical parts of the asset pipeline such texture compression, lightmap baking, shader compilation were tied to **Windows-only tools**. Where needed we went into update these tools ourselves, some of which were effectively end-of-life (replaced by tools for next-gen projects). But due to Apple’s development requirements, **certain build steps *had* to be done on Macs**. 

This meant:

* Standing up **dedicated macOS CI agents**.
* Creating **cross-platform build orchestration tools**.
* Splitting the pipeline to handle **per-platform asset finalization** (e.g., Metal shader compilation, entitlements signing, etc.).

It was frustrating at first. Tools would silently fail. Output formats differed subtly. But slowly, we built a Mac-first backend that could *mirror* the core engine build pipeline and allow us to iterate consistently on Apple hardware.


For the majority of our lifecycle, the team had no project. We were a long-shot R&D group just pushing what felt like a proof-of-concept. My discussions with other Producers was constantly the topic of "Chicken and the Egg". 

Then, suddenly, things changed.

Apple wanted Assassin’s Creed. Mirage was in development. And our team was given the mandate:

> *Ship Assassin’s Creed Mirage on iPhone and iPad in six months.*

We had just half a year to go from “chicken on a staircase” to a full city, characters, scripting, AI, and combat all running natively on Apple Silicon. What followed was the most intense production sprint I’ve been part of.

We pulled long hours.

Apple’s **Game Mode** and **MetalFX Upscaling** were critical. We weren’t the first team down this road. Capcom had already brought *Resident Evil Village* and *RE4* to Apple platforms and we studied their work **intensively**.


The Anvil Mobile journey began with a chicken mesh and no roadmap.

It ended with **Assassin’s Creed Mirage**  a fully-featured, console-quality game running on iPhone and iPad, powered by the same engine as its PS5 and Xbox counterparts. The leap was huge, but not impossible. The Apple ecosystem offered us a powerful, efficient, and tightly integrated platform and we learned to embrace its constraints to unlock its strengths.

We didn’t just port a game.
We rewired an engine, retooled a workflow, and redefined what AAA on mobile could mean.

And it all started with a chicken.

Oh, and I finally achieved the life long dream of having my work shown at an Apple Keynote.
