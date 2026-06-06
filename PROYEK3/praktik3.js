document.querySelectorAll('.tombol-tab').forEach(btn => {
   btn.addEventListener('click', () => {
      gantiTab(btn.dataset.tab);
   });
});

function gantiTab(tabId) {
    if (!tabId) return;

    // Reset status kelas aktif pada navigasi dan panel
    document.querySelectorAll('.tombol-tab').forEach(b => b.classList.remove('aktif'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('aktif'));
    const tombolTujuan = document.querySelector(`.tombol-tab[data-tab="${tabId}"]`);
    const panelTujuan = document.getElementById(tabId);

    if (tombolTujuan) tombolTujuan.classList.add('aktif');
    if (panelTujuan) {
        panelTujuan.classList.add('aktif');
        // Trigger ulang animasi angka saat masuk ke tab ikhtisar
        if (tabId === 'ikhtisar') jalankanPenghitung();
    }
}

function jalankanPenghitung() {
   document.querySelectorAll('.kartu-stat').forEach(kartu => {
      const el = kartu.querySelector('.penghitung');
      const target = +kartu.dataset.target;
      let n = 0; const langkah = target / 60;
      const jalankan = () => {
         n = Math.min(n + langkah, target);
         el.textContent = Math.floor(n).toLocaleString();
         if (n < target) requestAnimationFrame(jalankan);
      };
      requestAnimationFrame(jalankan);
   });
}
jalankanPenghitung();

document.querySelectorAll('.judul-akordion').forEach(tombol => {
    tombol.addEventListener('click', () => {
        const item = tombol.parentElement;
        item.classList.toggle('buka');
    });
});

if (localStorage.getItem('tema') === 'gelap') {
    document.body.classList.add('gelap');
}

const themeBtn = document.querySelector('#theme-btn');
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('gelap');
        const d = document.body.classList.contains('gelap');
        localStorage.setItem('tema', d ? 'gelap' : 'terang');
    });
}