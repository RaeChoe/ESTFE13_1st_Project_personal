const popup = document.querySelector("#popup");
const popupCloseBtn = popup.querySelector("button");

popup.style.visibility = document.cookie.includes("popup=close") ? "hidden" : "visible";

popupCloseBtn.addEventListener("click", () => {
  popup.style.visibility = "hidden";
  if (agree.checked) {
    createCookie("popup", "close", 1);
  } else {
    createCookie("popup", "close", -1);
  }
});

function createCookie(n, v, e) {
  let today = new Date();
  today.setDate(today.getDate() + 1);
  document.cookie = `${n}=${v}; Expires=${today.toString()}`;
}
