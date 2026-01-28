# Handoff Document - WorldWind Tile Bug Fixes

**Date:** 2026-01-27
**Branch:** main
**Last Commit:** 137934d

---

<original_task>
Fix the patchwork tile rendering issue when zooming in/out on the globe by switching to a higher-resolution imagery layer. The original plan was to replace BMNGLayer with BMNGLandsatLayer.
</original_task>

<work_completed>

## Summary
Fixed multiple rendering artifacts caused by WorldWind's broken tile coordinate system. The original plan to use BMNGLandsatLayer was abandoned after discovering fundamental bugs in WorldWind's tiling system.

## Commits Made (5 total, all pushed to origin/main)

1. **36a82a1** - `fix: use BMNGOneImageLayer to fix tile misalignment`
   - File: `src/components/Globe.jsx:59`
   - Changed: `new WorldWind.BMNGLayer()` → `new WorldWind.BMNGOneImageLayer()`

2. **9595bb2** - `docs: document imagery layer choice and tile alignment bug`
   - File: `CLAUDE.md`
   - Added Known Issues section about tile bug
   - Added Technical Notes about imagery layer selection

3. **32014a6** - `fix: remove SurfacePolygon fill causing rendering artifact`
   - File: `src/layers/createUSBorderLayer.js:176-187`
   - Removed SurfacePolygon interior fill that caused rectangular artifact in Pacific Ocean

4. **fe6ef72** - `fix: remove SurfacePolygon base fill from defense domes`
   - File: `src/layers/createDefenseDomes.js:126-128`
   - Removed SurfacePolygon base circle from all three defense dome layers

5. **137934d** - `docs: update documentation for SurfacePolygon removal`
   - File: `CLAUDE.md`
   - Updated dome construction section
   - Updated US border section
   - Expanded Known Issues to cover all tile coordinate bugs
   - Added rule: do not use SurfacePolygon in this project

## Key Discoveries

1. **BMNGLayer tile misalignment**: Northern and southern hemisphere continents appeared in completely wrong positions (Africa showing where South America should be)

2. **BMNGLandsatLayer**: Same issue as BMNGLayer - did not fix the problem

3. **BingAerialLayer**: Even worse - hardly any land visible

4. **BMNGOneImageLayer**: Works correctly because it uses a single pre-rendered image that bypasses the broken tile system

5. **SurfacePolygon bug**: Any SurfacePolygon renderable causes rectangular artifacts in unrelated screen areas due to the same tile coordinate calculation bug

## Files Modified

| File | Change |
|------|--------|
| `src/components/Globe.jsx` | Line 59: BMNGLayer → BMNGOneImageLayer |
| `src/layers/createUSBorderLayer.js` | Removed lines 176-187 (SurfacePolygon fill) |
| `src/layers/createDefenseDomes.js` | Removed lines 126-128 (base circle SurfacePolygon) |
| `CLAUDE.md` | Multiple sections updated with tile bug documentation |

</work_completed>

<work_remaining>

## No Immediate Work Required

All identified rendering issues have been fixed and pushed. The application is in a working state.

## Potential Future Improvements

1. **Higher resolution imagery**: If higher resolution is needed when zoomed in, investigate:
   - Custom WMS/WMTS server with working tile coordinates
   - Alternative globe libraries (CesiumJS, MapboxGL)
   - Patching WorldWind's tile coordinate calculation

2. **Restore filled regions**: If filled domes/border are desired:
   - Investigate using `Polygon` (3D) instead of `SurfacePolygon` (surface-projected)
   - May need custom WebGL rendering similar to SatelliteShape.js

3. **Dead code cleanup**: `createBaseCircle()` function in `createDefenseDomes.js` is now unused but left in place

</work_remaining>

<attempted_approaches>

## Approaches That Failed

1. **BMNGLandsatLayer** (original plan)
   - Result: Same tile misalignment as BMNGLayer
   - Conclusion: Issue is in WorldWind's TiledImageLayer base class, not specific imagery source

2. **BingAerialLayer**
   - Result: Worse than BMNGLayer - hardly any land visible
   - Conclusion: Confirms issue is in tile coordinate calculation, not WMS server

3. **NASA WMS Server investigation**
   - Tested direct WMS requests with curl - both returned HTTP 200 with valid JPEG images
   - Conclusion: Server is working; issue is client-side tile placement

## Root Cause Analysis

- WorldWind Issue #793 on GitHub discusses coordinate precision problems
- The `epsg3857ToEpsg4326` function uses insufficient precision
- Affects all classes that extend `TiledImageLayer` or use internal tile subdivision
- `SurfacePolygon` also uses internal tiling for rendering, inheriting the same bug

</attempted_approaches>

<critical_context>

## Critical Rules for This Project

**DO NOT USE:**
- `BMNGLayer`, `BMNGLandsatLayer`, `BingAerialLayer`, or any `TiledImageLayer` subclass
- `SurfacePolygon` for any filled shapes
- Any WorldWind class that relies on internal tile subdivision

**SAFE TO USE:**
- `BMNGOneImageLayer` (single image, no tiles)
- `Path` renderables (work correctly)
- `Placemark` renderables (work correctly)
- Custom WebGL rendering (like `SatelliteShape.js`)

## WorldWind Library Details

- Package: `worldwindjs@^1.7.0` (installed: 1.9.5)
- Source image: `public/images/BMNG_world.topo.bathy.200405.3.2048x1024.jpg`
- The v1.9.5 release notes mention fixing "geo-registration of WMTS tiles that use the EPSG 3857 projection" but this did not fix the WMS/BMNG issues

## Tradeoffs Accepted

1. **Lower resolution imagery**: BMNGOneImageLayer is 2048x1024 pixels - acceptable for strategic/continental zoom levels but blurry at close zoom
2. **No filled regions**: Defense domes and US border are outline-only - still looks good with the glow/halo effects

## Environment

- Working directory: `/Users/box/Desktop/worldwind-js-app/worldwind-js-app`
- Dev server: `npm run dev` → http://localhost:5173
- Git remote: `github.com:jasonbox73/worldwind-js-app.git`
- Branch: `main`

</critical_context>

<current_state>

## Status: Complete

All rendering artifacts have been fixed. Application is working correctly.

## Git State

- Branch: `main`
- All changes committed and pushed to origin
- Working tree: clean
- Latest commit: `137934d docs: update documentation for SurfacePolygon removal`

## Application State

- Globe renders correctly with BMNGOneImageLayer
- US Border layer displays golden halo outline (no fill)
- Defense domes display arc outlines (no base fill)
- All other layers (satellites, sensors, overlay) working correctly
- No visible rendering artifacts

## Verification Completed

User manually verified:
- Globe imagery aligned correctly (continents in right positions)
- No patchwork artifacts when zooming
- No rectangular artifacts in Pacific Ocean
- Defense dome layers render without artifacts
- US Border layer renders without artifacts

</current_state>
