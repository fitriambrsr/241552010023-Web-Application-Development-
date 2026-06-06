document.querySelector("#formulir")
  .addEventListener("submit", e => {
    e.preventDefault();

    const semuaValid = [
      validasi("nama", v => v.length >= 3, "Min. 3 karakter"),
      validasi("email", v => /\S+@\S+\.\S+/.test(v), "Email tidak valid"),
      validasi("password", v => v.length >= 8, "Min. 8 karakter"),
    ].every(Boolean);

    if (!semuaValid) return;

    document.querySelector("#sukses")
      .classList.remove("tersembunyi");

    document.querySelector("#formulir")
      .classList.add("tersembunyi");

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2000);
  });

function validasi(id, kondisi, pesan) {
  const input = document.getElementById(id);
  const error = input.parentElement.querySelector(".pesan-error");

  if (!kondisi(input.value)) {
    error.textContent = pesan;
    return false;
  }

  error.textContent = "";
  return true;
}


document.getElementById("nama").addEventListener("input", () => {
  validasi("nama", v => v.length >= 3, "Min. 3 karakter");
});

document.getElementById("email").addEventListener("input", () => {
  validasi("email", v => /\S+@\S+\.\S+/.test(v), "Email tidak valid");
});

document.getElementById("password").addEventListener("input", () => {
  const val = document.getElementById("password").value;
  const bar = document.querySelector(".isian");

  let strength = val.length * 10;
  if (strength > 100) strength = 100;

  bar.style.width = strength + "%";

  if (strength < 40) bar.style.background = "red";
  else if (strength < 70) bar.style.background = "orange";
  else bar.style.background = "green";

  validasi("password", v => v.length >= 8, "Min. 8 karakter");
});