---
name: "objekts Character Continuity Production"
slug: "objekts-character-continuity-production"
description: "Production methodology for recurring AI characters: identity, face, body, wardrobe, camera and temporal continuity across multi-shot work. First-party skill by objekts."
category: "Image & Creative Automation"
framework: "MCP"
verification: listed
source: "https://github.com/peach420fuzz/objekts-production-desk"
---

# objekts Character Continuity Production

Use this skill when the same AI-generated or hybrid character must survive across multiple shots, versions or environments.

Do not treat one character image as an undifferentiated control source. Map identity, face, body proportions, wardrobe, hair and makeup, age, expression range, pose, lighting, camera and action continuity separately. A reference can control identity and wardrobe without controlling camera or lighting. Keep these authority boundaries explicit so later generations do not inherit accidental properties from the wrong image.

The expensive failure in multi-shot work is often drift that appears only when shots are assembled in edit. Run a continuity PoC before full production: choose representative angles, shot sizes, motion states and lighting contexts, then verify the approved identity and wardrobe/body cues simultaneously. If exact identity is a hard lock, avoid free generative routes and keep deterministic cleanup available for details that must not drift.

This is a first-party public skill from **objekts**.

## Installation

```bash
npx skills add peach420fuzz/objekts-production-desk --full-depth --skill character-continuity-production
```

Remote MCP:
```
https://mcp.objekts.ai/mcp
```

Source: https://github.com/peach420fuzz/objekts-production-desk
Studio: https://objekts.ai/
