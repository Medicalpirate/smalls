# Lægereolen – kode til overførsel af prototypefunktioner

Demo: https://laegereolen-prototype.vercel.app/

Dette er en fungerende frontendprototype i HTML, CSS og JavaScript ES-moduler. Bogvisning bruger en reel EPUB via epub.js. Der er ingen buildproces, backend, login eller database. Brug prototypen som reference for UX og adfærd, og overfør funktionerne til den eksisterende produktionskode i små feature branches og pull requests.

## Kør lokalt

Kræver Node.js 22 eller nyere. Der skal ikke installeres npm-pakker.

```sh
npm run dev
npm test
```

Åbn http://127.0.0.1:8766/. Brug en webserver frem for at åbne index.html som en lokal fil, fordi ES-moduler og EPUB læses over HTTP.

## Koden

| Fil | Ansvar |
| --- | --- |
| app.mjs | Læser, modes, søgning, TOC, bogmærker, fælles state og EPUB-integration |
| data.mjs | Bog/kapitel/afsnit/paragraph-ID'er, figurkilder og demo-forfatterannotationer |
| annotations.mjs | Tekstintervaller, overlappende overstregninger og migrering af gamle noter |
| highlight-tools.mjs | Farvepalette og noteeditor med gem, annuller og slet note |
| reader-features.mjs | Kliniske værktøjer, studieprogression, forklaringer, billedatlas og annotationstoggle |
| study-core.mjs | Cloze-kort, normaliserede billedmasker og enkel repetitionsplan |
| studiekort-widget.js | Korteditor, billedmaskering, kortsamling og repetitionsvisning i Shadow DOM |
| styles.css / features.css | Responsivt layout, temaer, læseoplevelser og komponenter |
| demo.epub / vendor/ | Demobog, epub.js og JSZip med deres licensfiler |

Annotationer på billeder ligger i et separat lag. Polygoner, pile og labels bruger procentkoordinater i forhold til billedet. Den enkelte figurs valg synkroniseres mellem Studierum og den store billedvisning. Billedatlasset bruger samme funktion i klinisk mode. Forfatterens editor er ikke implementeret; data.mjs indeholder eksempler på den metadata, en editor senere skal gemme.

## GitHub, CI og test

Koden ligger i Medicalpirate/smalls på branchen laegereolen-prototype med en pull request mod main. GitHub Actions-workflowen i .github/workflows/ci.yml kører de 10 Node-tests ved push og pull request. Se den konkrete CI-status under Actions eller pull requestens Checks. Vercel-demoen er udgivet direkte som statiske filer; GitHub og Vercel er endnu ikke koblet til automatisk deployment.

De automatiske tests dækker overlappende highlights, notemigrering, cloze-kort, repetitionsdatoer, billedmaskernes grænser, figurernes kildeankre, søgesynonymer og annotationsgeometri. Browserkontroller har desuden dækket de faktiske brugerflows. Testene giver ikke fuld browser- eller produktionsdækning. Den eksisterende udvikling er ikke dokumenteret som et TDD-forløb.

Ved overførsel kan følgende bruges som acceptance criteria og skrives som regressionstests før ændringen:

- Toggle fra skjuler alle pile, farveområder, labels og forklaringer. Toggle til viser dem. Valget huskes, og læser og billeddialog er enige.
- Resize/zoom bevarer placeringen af figurannotationer og kortmasker.
- Annuller i noteeditor ændrer ikke den gemte note. Slet note bevarer selve overstregningen.
- En kortkilde fører tilbage til det rigtige bogafsnit. Tekst- og figurkort kan oprettes, redigeres og repeteres.
- Skift mellem klinik, studie og EPUB bevarer personlige noter og bogmærker.

Foreslået integrationsforløb: én feature branch per funktion → unit- og integrationstest i jeres stack → browser/E2E-test af ovenstående flows → PR-review → Vercel preview → merge, når CI er grøn. Tilslut workflow og deploy til jeres eksisterende pipeline.

## Tilpasning til produktion

Personlige noter, kort, progression og valg gemmes kun i localStorage. Flyt dette til brugerafgrænset lagring med autentifikation og migrering. Bevar stabile bog-, afsnits- og paragraph-ID'er som kildeankre; EPUB-import skal knytte disse til bogens faktiske strukturer.

AI-chat og forklaringer er forberedte demosvar. Kort fra tekst bruger cloze; figurkort bruger manuel billedmaskering. Der er ingen LLM-kald, Anki Desktop-synkronisering, APKG-eksport eller FSRS-planlægning. Repetitionen er en enkel prototypeplan.

## Indhold og licenser

Indholdet er kort, parafraseret demoindhold fra Wikipedia og sundhed.dk/Lægehåndbogen med kildelinks i læseren. Brug jeres eget bogindhold i produktet. Thoraxfoto: Ptrump16, Chest X-ray.jpg, CC BY-SA 4.0. Håndeksemfoto: Haendels, Handekzem dyshidrosiform.jpg, CC BY-SA 3.0. Kilde- og licenslinks findes i data.mjs og EPUB'en. airways.svg er en skematisk demofigur. Bevar attribution og overhold billedlicenserne ved genbrug. Tredjepartsbibliotekernes licenser ligger i vendor/.

Pakken indeholder ingen Vercel-loginoplysninger, API-nøgler eller personlige noter fra browseren.
