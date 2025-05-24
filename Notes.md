Sidebar and HeaderBar as of [today’s date] are working perfectly.
- Do NOT change their hamburger position or animation.
- Tomorrow, we will work on Sidebar text, project text, and add project images.
- Keep the current navigation and header logic as-is.
- Any changes should only affect Sidebar/project text/images—not the header/sidebar structure or logo/hamburger logic.
# Video Poster and Loading Guide for Studio-Stewart

## Context:
- Large video (`enscapeentry.mp4`) is in `/public/videos/` and tracked with Git LFS.
- On site, video shows as blank rectangle before loading/playing.
- Suspect: Large file size causes slow load, so no preview appears until enough data is loaded.

## Goals for Tomorrow:
1. **Create and add a poster image** (first frame of video recommended) to use as a preview.
2. **Update the `<video>` tag** in code to use the `poster` attribute, e.g.:
   ```jsx
   <video
     src="/videos/enscapeentry.mp4"
     poster="/videos/enscapeentry-thumbnail.jpg"
     controls
   />
   ```
3. **Confirm video and poster image load correctly.**

## Questions/Things to Check:
- Confirm video works after adding poster.
- Should the poster image be the very first frame, or a different part?
- If issues persist, consider compressing video further for faster load.

---

**Send this note back to Copilot so you can pick up right where you left off!**
