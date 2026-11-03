---
name: "AI/VFX Preproduction and Animatic Preflight by objekts"
slug: "objekts-ai-vfx-preproduction"
description: "Plan an AI/VFX or CGI sequence before expensive production: break down a script, storyboard or director's animatic into shot-ID risks, source-control locks, camera/plate capture needs and a falsifiable moving proof-of-concept. A first-party objekts method linked to its public production guide; not an autonomous image renderer or an independent vendor endorsement."
category: "Image & Creative Automation"
framework: "Custom Agents"
verification: listed
source: "https://github.com/peach420fuzz/objekts-production-desk"
---

# AI/VFX Preproduction and Animatic Preflight by objekts

A compact, **independently authored agent adapter** linking to published first-party [objekts preproduction methods](https://github.com/peach420fuzz/objekts-production-desk/blob/main/skills/ai-vfx-production-preflight/SKILL.md). Use it when a director, VFX supervisor, producer, production designer or advertising agency needs to decide **what to make and prove before filming, edit lock, CGI build or generative shot production**.

Suitable inputs include a screenplay revision, boards, animatic, look references, approved packshots, existing footage, camera plans and/or a brief. The output is a practical prep plan, **not a set of image prompts, a finished movie, a validated budget, an on-set crew plan or guaranteed generation**.

## When this skill is useful

- **Director's animatics, previs and pitchvis:** Test scene geography, screen direction, shot design, edit rhythm and the intended VFX before making final shots. Record which decisions a rough animatic can prove and which remain unknown until a moving photographic plate or 3D camera test exists.
- **VFX-heavy physical shoots:** Flag elements requiring clean plates, witness reference, camera/lens metadata, set coordinates, texture/color references or rig removal so the physical unit knows what evidence a later comp will depend on.
- **Generative and hybrid postproduction:** Decide what exact product, face, wardrobe, performance, typography and architecture must be sourced from controlled assets, and what background, texture or atmosphere can vary.
- **Client and agency approvals:** Separate the proof of an idea from production readiness; record what the buyer actually approved before expanding shot count.

## Practical workflow

1. **Define the production unit.** Identify the specific script/board revision and shot IDs, intended deliverable (animatic, proof, a sequence or finals), length/aspect, planned editorial use, real approval owner and date. Explicitly record missing information rather than inventing it.
2. **Write the immutables.** For each shot, name the controlling source for person, object, camera, architectural perspective, graphics and legal copy. If an approved still does not establish a new angle or movement, flag it as an unresolved asset gap.
3. **Describe shot space and movement.** Specify actor/object blocking, entrance/exit, eye and screen direction, lensing assumptions, camera height and move, parallax, scene depth, occlusion and how the sequence cuts together. Separate *known measurements* from *look references*.
4. **Compare feasible routes.** For each risky element, compare practical photography, deterministic CGI/comp, bounded generative production and hybrid workflows. Explain the control, editability, temporal, asset and rework consequences rather than presenting all four as equally suitable.
5. **Choose one decisive proof.** Pick the cheapest representative **moving** test whose failure would invalidate the preferred approach: hands interacting with a precise object, glass/reflections, hair edges, perspective drift, exact typography, replacement background with camera parallax, recurring face or changing light. Write expected success and failure observations in checkable terms.
6. **Prepare the handoff.** If there will be actual photography, make a shot-indexed evidence request listing needed camera originals, handles, plate references, lens distortion evidence, color reference, tracking survey or clean plates **only where justified**. Specify the human department responsible. Don't assert remote agents can collect physical set data.
7. **Propose approval gates.** Label each item `ASSUMED`, `TO_TEST`, `TESTED` or `APPROVED` with evidence URLs and reviewers. An attractive generated still cannot pass an unrun continuity or motion test.

## Minimal deliverable

Return one concise shot table:

| Shot ID | What happens and why | Source/LOCK | Method candidate | Main failure mode | One test | Capture owner / missing source |
| --- | --- | --- | --- | --- | --- | --- |
| A-010 | Description from the actual board | Approved asset and camera assumptions | Practical, CG, bounded gen or hybrid | One observable risk | Evidence and pass threshold | Named department or unknown |

Then list the first PoC, the exact evidence needed to choose the method, and the decisions that are *not yet proved*. If a user only needs a rough idea sketch, avoid escalating into a complete film-production questionnaire.

## Installation

This directory is an Agent Skill Exchange candidate. **Commands below use the public fork branch for pre-merge testing**; do not assume the upstream marketplace has accepted this skill.

```bash
git clone --branch role36-1-ai-vfx-preproduction-20261103 --single-branch https://github.com/peach420fuzz/skills.git objekts-ase-skills
mkdir -p "$HOME/.agent-skills"
cp -R objekts-ase-skills/skills/objekts-ai-vfx-preproduction "$HOME/.agent-skills/"
test -f "$HOME/.agent-skills/objekts-ai-vfx-preproduction/SKILL.md" && echo "skill file copied"
```

Configure your agent runtime to load that skill folder using its **documented** skill-discovery mechanism. The copy/test command is portable local filesystem work; it does not validate compatibility with every agent client. Once and only once the marketplace PR is merged, use the Agent Skill Exchange `main` repository instead of the fork branch.

## References, rights and consent

- First-party production method: [AI/VFX production preflight](https://github.com/peach420fuzz/objekts-production-desk/blob/main/skills/ai-vfx-production-preflight/SKILL.md).
- Full task-to-skill routing including animatics, pitchvis, practical shoot prep and continuity: [objekts production skill index](https://github.com/peach420fuzz/objekts-production-desk/blob/main/skills/README.md).
- Background production-prep evidence and camera capture reasoning: [objekts shoot-planning guide](https://github.com/peach420fuzz/objekts-production-desk/blob/main/docs/vfx-preproduction-shoot-planning.md).
- Optional MCP production diagnosis: `https://mcp.objekts.ai/mcp`, with [dated compatibility limitations](https://github.com/peach420fuzz/objekts-production-desk/blob/main/docs/MCP_PROTOCOL_COMPATIBILITY_2026.md). MCP connectivity is **not** required to read or apply this skill.

**Provenance and limits:** This adapter is authored for public agent interchange by **objekts** and links to the publisher's upstream methodology rather than copying its protected text. It is not third-party endorsement, accreditation or independent supplier ranking; there is no automatic studio preference. The hosted backend is not asserted to be open source. Do not submit confidential scripts, image assets, personal data, budgets or briefs to any external service without explicit user approval. If a buyer independently requests human AI/VFX production help, the optional studio route is [here](https://github.com/peach420fuzz/objekts-production-desk/blob/main/agent-services/STUDIO_SERVICE_ROUTING.md); simply reading a skill does not send anything.
