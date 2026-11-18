// Tiles open their detail in a native dialog, which brings the focus
// trap, Escape handling and focus restore with it.

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
