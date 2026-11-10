# Writes the page's icon set into icons/ from V1's brand drawing: the same dark tile the Production app uses as its
# tab / home-screen icon (dark_tile in FitnessDashboard/V1/MasterDashboard/Brand/rebuild-runner.py), at each size a
# browser asks for. Re-run only when the brand drawing changes, then `node build-from-v1.js`.
#   python3 make-icons.py [path/to/FitnessDashboard]     (needs Pillow, numpy, scipy — the same as rebuild-runner.py)
#
#   favicon-32.png        browser tab + bookmarks (desktop / Android)
#   apple-touch-icon.png  iPhone / iPad home screen and Safari bookmarks & favourites (180 px, iOS rounds it)
#   icon-192.png / -512   Android home screen (manifest.webmanifest, purpose "any")
#   icon-maskable-512.png Android adaptive icon: runner shrunk into the circle-safe zone so no launcher shape crops it
import importlib.util, os, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
repo = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'FitnessDashboard'))
brand = os.path.join(repo, 'V1', 'MasterDashboard', 'Brand')
spec = importlib.util.spec_from_file_location('rebuild_runner', os.path.join(brand, 'rebuild-runner.py'))
rr = importlib.util.module_from_spec(spec); spec.loader.exec_module(rr)

art = Image.open(os.path.join(brand, 'source', 'runner-original-cutout-321.webp')).convert('RGBA')
out = os.path.join(HERE, 'icons'); os.makedirs(out, exist_ok=True)
for name, size, figure in (('favicon-32.png', 32, 0.84), ('apple-touch-icon.png', 180, 0.84), ('icon-192.png', 192, 0.84),
                           ('icon-512.png', 512, 0.84), ('icon-maskable-512.png', 512, 0.62)):
    rr.dark_tile(art, size, figure).save(os.path.join(out, name), optimize=True)
    print(name, os.path.getsize(os.path.join(out, name)))
