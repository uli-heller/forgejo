Uli's Bau-Anleitung
===================

Build-Container einrichten
--------------------------

* Ausgangspunkt: Ubuntu-20.04 Basisinstallation
* Zusatzpakete installieren
    * `sudo apt install make`
    * `sudo apt install build-essential`
* Neuere Version von Go installieren
    * `mkdir -p Software`
    * `cd Software`
    * `GO_VERSION=1.17.3`
    * `wget https://golang.org/dl/go${GO_VERSION}.linux-amd64.tar.gz`
    * `rm -rf go`
    * `gzip -cd go${GO_VERSION}.linux-amd64.tar.gz|tar xf -`
* PATH erweitern in ~/.bashrc:
    ```diff
    +PATH="${HOME}/Software/go/bin:${PATH}"
    +export PATH
    ```
* Neuere NodeJS-Version installieren
    * `mkdir -p Software`
    * `cd Software`
    * `NODEJS_VERSION=16.13.0`
    * `wget https://nodejs.org/dist/v${NODEJS_VERSION}/node-v${NODEJS_VERSION}-linux-x64.tar.xz`
    * `rm -f node`
    * `xz -cd node-v${NODEJS_VERSION}-linux-x64.tar.xz | tar xf -`
    * `ln -s node-v${NODEJS_VERSION}-linux-x64 node`
* PATH erweitern in ~/.bashrc:
    ```diff
    +PATH="${HOME}/Software/node/bin:${PATH}"
    +export PATH
    ```

Bauen
-----

Bei mir erfordert das Bauen
Tätigkeiten am lokalen Arbeitsplatz
und am Build-Container.

### Lokaler Arbeitsplatz

#### Ablauf  bei der ersten Version

* Basisversion wählen: v1.13.2
* Basisversion auschecken: `git checkout -b 1.13.2-uli v1.13.2`
* Zusammenführen mit "anderen" Versionen
    * `git log ed25519_sk`
    * `git cherry-pick 406fa489ba80f73e879f9336ee1689eb2eecccdb`
* Eventuell noch zusätzliche Änderungen vornehmen
* Version hochschieben nach Github: `git push -u origin 1.13.2-uli`
* Tag erzeugen: `git tag 1.13.2-uli-01` 
* Tag hochschieben: `git push --tags`

#### Ablauf bei Folgeversionen

Voraussetzung: Es gibt bereits einen Zweig (branch) mit allen
gewünschten Modifikationen. Wir wollen diese nur für einen neuen
Basiszweig übernehmen!

- Hilfsskript: [new-version.sh](tools/new-version.sh)
- Aufruf: `./tools/new-version.sh v1.15.5 v1.15.6`

### Build-Container

* Anmelden mit `ssh -A...`, damit wir eine Verbindung zu GITHUB bekommen
* Alle Dinge von GITHUB abholen: `git fetch --all -p` -> neues Tag wird angezeigt
* Tag auschecken: `git checkout 1.15.6-uli-09` -> Warnung bzgl. 'detached HEAD' ignorieren
* Versionstest: `git describe --tags --always` -> neues Tag wird angezeigt
* Bauen:
    ```
    make clean
    git clean -fdx
    TAGS="bindata sqlite sqlite_unlock_notify" make build
    ```
* Erneuter Versionstest: `./gitea --version` -> "Gitea version 1.15.6+uli-09 built with..."
* Artefakt zum Hochladen erzeugen: `xz -c9 gitea >gitea-1.15.6-uli-09-linux-amd64.xz`
* Artefakt in Github ablegen und lokal löschen

Historie
--------

2021-12-03 - Neue Version von Go (1.17.3), build-essential
2021-10-28 - Anpassung auf gitea-1.15.6
2021-10-27 - Neue Version von Go (1.17.2) und NodeJS (16.13.0)
2021-10-26 - Prähistorie
