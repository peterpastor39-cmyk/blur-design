# Orbit gallery rebuild

Build target: the user's STUDIO HRSE Framer `OrbitSphereGalleryMask` instance, inspected through its property panels and live rendered DOM. This replaces the earlier fixed-position drift implementation. The component source was not available in the local code asset list; sphere distribution and motion are reconstructed from the exposed settings and observed output.

| Decision | Inspected source | Local application |
| --- | --- | --- |
| Automatic rotation | 10 degrees/second, axis tilt 45 degrees | Quaternion rotation about a tilted axis |
| Interactive rotation | Drag sensitivity 50%, momentum 90, wheel enabled | Drag with decaying angular velocity and wheel spin |
| Card treatment | Fixed 200 × 200, 40% variation, radius 6, hover 1.1 | Square crops using all seven user images; upright billboards |
| Sphere distribution | Density 400, cloud jitter 20%, size 88% | Radius 400 with deterministic 20% variation; even spherical distribution |
| Projection | 1200 × 800 preview: perspective 1560, group scale 0.506912 | Matching reference scale at that size; responsive fit on phones |
| Depth | Rendered cards move in X/Y/Z; fog 0% | Perspective projection, sorted overlap, no fog |
| Reveal | 0.15s stagger, 0.8s delay and duration, Bezier .77/0/.175/1, pop-in 1.5 | Staggered clipping with image scale settling from 1.5 to 1 |
| Existing Blur identity | Cormorant outline headline and Aspekta navigation | Preserved; original automatic character flicker retained |
| White theme follow-up | User requested a white background | White canvas, charcoal characters and logo, dark navigation and buttons; original headline contrast also checked |

Validation:

- Production build and TypeScript passed.
- Compared browser layout at the same 1200 × 800 size as the Framer preview.
- All seven images loaded. Depth values changed during automatic rotation and overlap order matched depth.
- Drag changed orientation and carried momentum after release (measured 78 degrees/second against ambient speed 10).
- Wheel input changed rotation. Hover scale reached 1.1.
- Pause froze all seven transforms and orientation; resume preserved the current orientation.
- 390 × 844 phone check: all cards fit, no horizontal overflow, navigation and footer clear.
- Reduced motion disables rotation, input motion, hover enlargement, and reveal animation; static code path reviewed.
- Browser warning/error log checked at handoff.
- Follow-up timing fix: reveal and rotation use elapsed wall time, with analytically decayed momentum, so throttled visible frames do not delay the entry reveal. White-theme build passed and browser log was empty.

Preview: http://localhost:3000/hero-study
