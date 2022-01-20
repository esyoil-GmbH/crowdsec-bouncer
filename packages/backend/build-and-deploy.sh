#!/bin/sh

npm i
npm run build
zip -r v$1 . -x "node_modules/*"
scp v$1 ops@rp.esyoil.com:/home/ops/backend/
echo "Fertig." 