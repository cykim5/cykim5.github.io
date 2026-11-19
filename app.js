// Tiles open their detail in a native dialog, which brings the focus
// trap, Escape handling and focus restore with it.

// The molecular viewer is a few megabytes, so it is fetched the first
// time someone opens the sheet that shows a structure and never on an
// ordinary visit. If the fetch fails the sheet still reads fine; the
// box is simply empty, and the caption still links to the entry.
let structureAsked = false;
function loadStructure() {
  if (structureAsked === true) return;
  structureAsked = true;
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/pdbe-molstar@3.11.0/build/pdbe-molstar-component.js";
  script.addEventListener("load", () => hideViewerAxes(40));
  document.head.appendChild(script);
}

// The model frame carries its geometry inline and is a couple of
// megabytes, so the frame stays empty until the sheet it lives in is
// opened. After that it keeps whatever the visitor set it to.
function loadModel() {
  const frame = document.querySelector("#p2 iframe[data-src]");
  if (frame === null) return;
  frame.addEventListener("load", () => {
    const waiting = frame.parentElement.querySelector(".model-wait");
    if (waiting !== null) waiting.remove();
  });
  frame.src = frame.dataset.src;
  frame.removeAttribute("data-src");
}

// Mol* draws a small set of coloured axes in the bottom corner. They
// belong in a structural biology tool, not on a page like this one, so
// they go off as soon as there is a scene to turn them off in. Nothing
// else depends on this working, so a failure just leaves them drawn.
function hideViewerAxes(tries) {
  const viewer = document.querySelector("#p9 pdbe-molstar");
  try {
    viewer.viewerInstance.plugin.canvas3d.setProps({
      camera: { helper: { axes: { name: "off", params: {} } } }
    });
  } catch (error) {
    if (tries > 0) setTimeout(() => hideViewerAxes(tries - 1), 500);
  }
}

document.querySelectorAll("[data-open]").forEach((tile) => {
  tile.addEventListener("click", () => {
    const sheet = document.getElementById(tile.dataset.open);
    if (!sheet || typeof sheet.showModal !== "function") return;
    // A tile inside an open dialog opens its project on top of the
    // group. Dialogs stack natively, so closing the top one reveals
    // the group again with focus back on the tile that was clicked.
    // The flag only exists so the second backdrop can be lighter.
    if (document.querySelector("dialog.sheet[open]")) {
      sheet.dataset.nested = "";
    } else {
      delete sheet.dataset.nested;
    }
    if (tile.dataset.open === "p9") loadStructure();
    if (tile.dataset.open === "p2") loadModel();
    sheet.showModal();
  });
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

document.querySelectorAll("dialog.sheet").forEach((sheet) => {
  // Clicking outside the panel closes it. The dialog box covers only the
  // panel, so a click outside those bounds is the backdrop.
  sheet.addEventListener("click", (event) => {
    if (event.target !== sheet) return;
    const box = sheet.getBoundingClientRect();
    const inside =
      event.clientX >= box.left && event.clientX <= box.right &&
      event.clientY >= box.top && event.clientY <= box.bottom;
    if (!inside) sheet.close();
  });
});
