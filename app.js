// Project tiles open their detail in a native dialog, which gives us the
// focus trap and Escape handling for free.

document.querySelectorAll("[data-open]").forEach((tile) => {
  tile.addEventListener("click", () => {
    const sheet = document.getElementById(tile.dataset.open);
    if (!sheet) return;
    if (typeof sheet.showModal === "function") {
      sheet.showModal();
    } else {
      sheet.setAttribute("open", "");
    }
  });
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

// Clicking the backdrop closes the sheet. The dialog element itself fills
// the backdrop area, so compare against the inner panel's bounds.
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
