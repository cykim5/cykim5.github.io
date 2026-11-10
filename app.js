// Tiles open their detail in a native dialog, which brings the focus
// trap, Escape handling and focus restore with it.

document.querySelectorAll("[data-open]").forEach((tile) => {
  tile.addEventListener("click", () => {
    const sheet = document.getElementById(tile.dataset.open);
    if (sheet && typeof sheet.showModal === "function") sheet.showModal();
  });
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

// Clicking outside the panel closes it. The dialog box covers only the
// panel itself, so a click landing outside those bounds is the backdrop.
document.querySelectorAll("dialog.sheet").forEach((sheet) => {
  sheet.addEventListener("click", (event) => {
    if (event.target !== sheet) return;
    const box = sheet.getBoundingClientRect();
    const inside =
      event.clientX >= box.left && event.clientX <= box.right &&
      event.clientY >= box.top && event.clientY <= box.bottom;
    if (!inside) sheet.close();
  });
});
