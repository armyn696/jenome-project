#!/bin/bash

# Build main project (studyhub-interactives)
cd studyhub-interactives
npm install
npm run build

# Build flashcard project
cd ../Flashcard
npm install
npm run build
mkdir -p ../studyhub-interactives/public/flashcard
cp -r dist/* ../studyhub-interactives/public/flashcard/

# Build mindmap-ai project
cd ../mindmap-ai
npm install
npm run build
mkdir -p ../studyhub-interactives/public/mindmap/mindmap-ai
cp -r dist/* ../studyhub-interactives/public/mindmap/mindmap-ai/

# Build mindmap-manual project
cd ../mindmap-manual
npm install
npm run build
mkdir -p ../studyhub-interactives/public/mindmap/mindmap-manual
cp -r dist/* ../studyhub-interactives/public/mindmap/mindmap-manual/

# Build pdf-chat project
cd ../pastel-pdf-sorcery-test
npm install
npm run build
mkdir -p ../studyhub-interactives/public/pdf-chat
cp -r dist/* ../studyhub-interactives/public/pdf-chat/
