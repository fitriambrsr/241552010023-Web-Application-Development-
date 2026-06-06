if (localStorage.getItem("tema") === "gelap") {
  document.body.classList.add("gelap");
}

document.getElementById("theme-btn")
  .addEventListener("click", () => {

    document.body.classList.toggle("gelap");

    const tema = document.body.classList.contains("gelap")
      ? "gelap"
      : "terang";

    localStorage.setItem("tema", tema);
  });


const counters = document.querySelectorAll(".penghitung");

counters.forEach(el => {
  const target = +el.dataset.target;
  let n = 0;
  const langkah = target / 60;

  function jalan() {
    n += langkah;

    if (n < target) {
      el.innerText = Math.floor(n);
      requestAnimationFrame(jalan);
    } else {
      el.innerText = target;
    }
  }

  jalan();
});