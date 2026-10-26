# Maquettes produits 3D (Three.js)

Source des rendus `assets/products/*.png` (sauf `gaine-bbl.png`, photo fournie).

Pour régénérer après une modification de `mockup.html` :

```bash
cd mockups-3d
npm i three@0.170.0
cp ../assets/fonts/*.woff2 . && cp ../assets/logos/logo-sublime-transparent.png logo.png
mkdir -p out && node shoot.cjs "$PWD/out"
```
