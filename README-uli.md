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

Forgejo
-------

### Folgeversion

Beispiel: 7.0.2 -> 7.0.3

#### Ausgangspunkt

Ausgecheckte Version 7.0.2:

```
uli@ulicsl:~/git/forked/forgejo$ git status
Auf Branch 7.0.2-uli
Ihr Branch ist auf demselben Stand wie 'origin/7.0.2-uli'.

nichts zu committen, Arbeitsverzeichnis unverändert
```

#### Neue Version abholen

```
uli@ulicsl:~/git/forked/forgejo$ git fetch --all
Fordere an von upstream
remote: Enumerating objects: 3858, done.
remote: Counting objects: 100% (2202/2202), done.
remote: Compressing objects: 100% (768/768), done.
remote: Total 1601 (delta 1258), reused 1127 (delta 804), pack-reused 0
Empfange Objekte: 100% (1601/1601), 475.59 KiB | 4.21 MiB/s, fertig.
Löse Unterschiede auf: 100% (1258/1258), abgeschlossen mit 343 lokalen Objekten.
Von https://codeberg.org/forgejo/forgejo
 * [neuer Branch]          bp-v7.0/forgejo-1b12ca8                   -> upstream/bp-v7.0/forgejo-1b12ca8
 * [neuer Branch]          bp-v7.0/forgejo-82e0066                   -> upstream/bp-v7.0/forgejo-82e0066
 * [neuer Branch]          bp-v7.0/forgejo-853f005                   -> upstream/bp-v7.0/forgejo-853f005
 * [neuer Branch]          bp-v7.0/forgejo-d6915f4                   -> upstream/bp-v7.0/forgejo-d6915f4
   6c33d55d16..9c7ff70072  forgejo                                   -> upstream/forgejo
 + 9588e9caf0...f5157085aa renovate/ghcr.io-visualon-renovate-37.x   -> upstream/renovate/ghcr.io-visualon-renovate-37.x  (Aktualisierung erzwungen)
 * [neuer Branch]          renovate/github-text-expander-element-2.x -> upstream/renovate/github-text-expander-element-2.x
 * [neuer Branch]          renovate/github.com-golangci-golangci-lint-cmd-golangci-lint-1.x -> upstream/renovate/github.com-golangci-golangci-lint-cmd-golangci-lint-1.x
 * [neuer Branch]          renovate/github.com-jhillyerd-enmime-1.x  -> upstream/renovate/github.com-jhillyerd-enmime-1.x
 * [neuer Branch]          renovate/github.com-markbates-goth-1.x    -> upstream/renovate/github.com-markbates-goth-1.x
 * [neuer Branch]          renovate/swagger-ui-dist-5.17.x           -> upstream/renovate/swagger-ui-dist-5.17.x
   ba1f73f550..b5c49a19d2  v7.0/forgejo                              -> upstream/v7.0/forgejo
 * [neues Tag]             v7.0.3                                    -> v7.0.3
Fordere an von gitea
Fordere an von origin
```

#### Änderungen anpassen auf neue Version

```
uli@ulicsl:~/git/forked/forgejo$ git rebase v7.0.3
Erfolgreich Rebase ausgeführt und refs/heads/7.0.2-uli aktualisiert.

uli@ulicsl:~/git/forked/forgejo$ git checkout -b 7.0.3-uli
Zu neuem Branch '7.0.3-uli' gewechselt

uli@ulicsl:~/git/forked/forgejo$ git push -u origin 7.0.3-uli:7.0.3-uli
Objekte aufzählen: 1015, fertig.
Zähle Objekte: 100% (1015/1015), fertig.
Delta-Kompression verwendet bis zu 16 Threads.
Komprimiere Objekte: 100% (323/323), fertig.
Schreibe Objekte: 100% (773/773), 182.35 KiB | 10.73 MiB/s, fertig.
Gesamt 773 (Delta 589), Wiederverwendet 601 (Delta 431), Paket wiederverwendet 0 (von 0)
remote: Resolving deltas: 100% (589/589), completed with 217 local objects.
remote: 
remote: Create a pull request for '7.0.3-uli' on GitHub by visiting:
remote:      https://github.com/uli-heller/forgejo/pull/new/7.0.3-uli
remote: 
To github.com:uli-heller/forgejo.git
 * [new branch]            7.0.3-uli -> 7.0.3-uli
Branch '7.0.3-uli' folgt nun 'origin/7.0.3-uli'.
```

#### Tag

```
uli@ulicsl:~/git/forked/forgejo$ git describe --tags origin/7.0.2-uli
7.0.2-uli-21

# 21 ... weiterhin verwenden, wenn keine zusätzliche Änderung
# 22 ... README angepasst -> hochzählen
uli@ulicsl:~/git/forked/forgejo$ git tag 7.0.3-uli-22
uli@ulicsl:~/git/forked/forgejo$ git push --tags
Gesamt 0 (Delta 0), Wiederverwendet 0 (Delta 0), Paket wiederverwendet 0 (von 0)
To github.com:uli-heller/forgejo.git
 * [new tag]               7.0.3-uli-22 -> 7.0.3-uli-22
 * [new tag]               v7.0.3 -> v7.0.3
```

#### Bauen im Build-Container

* Anmelden mit `ssh -A...`, damit wir eine Verbindung zu GITHUB bekommen
* Alle Dinge von GITHUB abholen: `git fetch --all -p` -> neues Tag wird angezeigt
* Tag auschecken: `git checkout 7.0.3-uli-22` -> Warnung bzgl. 'detached HEAD' ignorieren
* Versionstest: `git describe --tags --always` -> neues Tag wird angezeigt
* Bauen:
    ```
    make clean
    git clean -fdx
    TAGS="bindata sqlite sqlite_unlock_notify" make build
    ```
* Hinweis: Obwohl wir FORGEJO bauen, wird ein Programm namens GITEA erzeugt!
* Erneuter Versionstest: `./gitea --version` -> "Forgejo version 7.0.3-uli-22+gitea-1.21.11..."
* Artefakt zum Hochladen erzeugen: `xz -c9 gitea >gitea-7.0.3-uli-22-linux-amd64.xz`
* Artefakt in Github ablegen und lokal löschen

Historie
--------

2024-05-23 - Abschnitt über FORGEJO
2021-12-03 - Neue Version von Go (1.17.3), build-essential
2021-10-28 - Anpassung auf gitea-1.15.6
2021-10-27 - Neue Version von Go (1.17.2) und NodeJS (16.13.0)
2021-10-26 - Prähistorie
