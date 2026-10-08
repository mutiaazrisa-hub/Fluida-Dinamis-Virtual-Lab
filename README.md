# Virtual Laboratorium Fluida Dinamis (SMA Kelas XI)

Simulasi interaktif: kontinuitas, debit, dan Bernoulli.

## Struktur (index.html HARUS di root repository)
```
index.html
.nojekyll
css/style.css
js/config.js  js/audio.js  js/app.js  js/simulasi.js  js/evaluasi.js
```

## Cara menjalankan di GitHub Pages
1. Upload ISI folder ini (bukan file .zip, bukan folder pembungkusnya) ke repository, sehingga `index.html` berada di halaman utama repo.
2. Buka **Settings → Pages**.
3. Pada *Build and deployment*, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
4. Tunggu 1-2 menit, lalu buka `https://<username>.github.io/<nama-repo>/`.

Catatan: membuka file lewat tampilan `github.com/.../blob/...` atau `raw.githubusercontent.com` tidak akan menjalankan web. Gunakan alamat github.io. Butuh internet untuk memuat Tailwind, Chart.js, MathJax, dan FontAwesome dari CDN.
