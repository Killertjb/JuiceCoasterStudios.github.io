const buttons = document.querySelectorAll(".product button");

buttons.forEach(btn => {
btn.addEventListener("click", () => {
alert("Product added to cart!");
});
});
