// Tiles open their detail in a native dialog, which brings the focus
// trap, Escape handling and focus restore with it.

let viewer = null;

// The 3D viewer is only fetched when the tilt stage popup is opened, so
// nothing on the landing page pays for it.
async function openViewer() {
  try {
    if (!viewer) viewer = await import("./viewer.js");
    viewer.startViewer();
  } catch (err) {
    const note = document.getElementById("viewerNote");
    if (note) note.textContent = "3D preview could not be loaded.";
  }
}

document.querySelectorAll("[data-open]").forEach((tile) => {
  tile.addEventListener("click", () => {
    const sheet = document.getElementById(tile.dataset.open);
    if (!sheet || typeof sheet.showModal !== "function") return;
    sheet.showModal();
    if (sheet.querySelector("#viewer")) openViewer();
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
