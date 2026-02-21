### Testowanie regresji wizualnej z wykorzystaniem Playwright i VRT (Visual Regression Tracker, open-source)

<details>

<summary>Visual Regression Testing – podejście i narzędzia (entry)</summary>
<br>

Visual Regression Testing (VRT) polega na porównywaniu pikseli wygenerowanych zrzutów ekranu (nie logiki aplikacji). Oznacza to, że testy wizualne nie sprawdzają poprawności działania funkcji biznesowych, lecz wykrywają różnice w wyglądzie UI. W konsekwencji nawet bardzo drobne zmiany w renderowaniu (inna czcionka, subpikselowe przesunięcie elementu czy różnice wynikające z systemu operacyjnego) mogą generować fałszywe błędy (false positives).<br>

Dobór narzędzi do testowania wizualnej regresji można rozpatrywać w kontekście „poziomów dojrzałości” projektu i organizacji.

- [ ] Dla małych i średnich projektów często wystarczające jest wykorzystanie natywnego **Visual Testing w Playwright**, uruchamianego w kontrolowanym środowisku (np. Docker).
<br>

- [ ] W przypadku średnich i większych projektów, gdzie istotny staje się proces przeglądu zmian oraz historia wersji UI, lepszym rozwiązaniem są narzędzia takie jak Visual Regression Tracker czy Percy (np. w ramach BrowserStack), oferujące centralne repozytorium obrazów i interfejs do akceptacji zmian.
<br>

- [ ] W projektach klasy enterprise (np. bankowość, globalne e-commerce), gdzie wymagane jest testowanie na wielu przeglądarkach i urządzeniach w skali, często wykorzystuje się rozwiązania chmurowe takie jak BrowserStack czy SauceLabs w połączeniu z modułami Visual Testing. Zapewniają one skalowalność i szerokie pokrycie środowisk, choć wiążą się z wyższymi kosztami.

</details>


### Wyzwania w testach wizualnej regresji

> [!NOTE]
> Visual Regression Testing porównuje piksele. Dlatego nawet drobne różnice w renderowaniu mogą generować fałszywe błędy. Na załączonej poniżej animacji widać subtelne różnice w pozycjonowaniu elementów. W rezultacie otrzymaliśmy fałszywie pozytywny wynik (false positive) na jednej z przeglądarek.

![alt text](vrt-playwright-failed-report.png)
![](vrt-playwright-failed.gif)
![alt text](vrt-playwright-failed-diff.png)
![alt text](vrt-playwright-failed-sidebyside.png)



1. Asynchroniczne renderowanie SPA (Angular / React / Vue)
Komponenty renderują się etapami (change detection, mikro-taski, lazy loading), co powoduje, że screenshot może zostać wykonany zanim UI osiągnie stabilny stan.

2. Różnice środowiskowe (OS / Docker / CI)
Różne systemy operacyjne, biblioteki systemowe i sterowniki mogą renderować tę samą stronę w nieco inny sposób.

3. Różne wersje przeglądarek
Nawet drobna zmiana wersji Chromium może wpływać na antyaliasing czcionek, łamanie tekstu, czy pozycjonowanie elementów o 1–2 px.

4. Animacje i przejścia CSS
Efekty typu fade, slide, spinner czy hover generują dynamiczne zmiany w czasie wykonywania screenshotu.

5. Dynamiczne dane
Daty, zegary, identyfikatory, dane z API czy feature flagi powodują, że widok nie jest deterministyczny.

6. Fonty i zasoby zewnętrzne
Brakujące lub różnie renderowane fonty (Mac vs Linux) to jedna z najczęstszych przyczyn fałszywych regresji wizualnych.



### Rozwiązania do zastosowania w tym projekcie

1. Stabilizacja DOM przed wykonaniem screenshotu - dodanie helpera waitForStableDom, który czeka aż DOM przestanie się zmieniać przez określony czas, zapobiega wykonywaniu screenshotu w trakcie renderowania SPA.

2. Konteneryzacja środowiska (Docker) - zapewnienie spójnej wersji systemu, przeglądarki i identycznego środowiska jak w CI.
Zastosowanie Remote Browser Pattern:
    (test -> websocket -> wspólny chromium -> screenshot (test runner ≠ browser environment)):
    - Kontener uruchamia jedną współdzieloną przeglądarkę Chromium jako serwer WebSocket
    - Testy NIE uruchamiają własnego browsera. Podłączają się do już działającego


3. Kontrola wersji przeglądarki - wykorzystanie przeglądarki dosterczonej przez playwright.

4. Izolacja dynamicznych elementów - mockowanie (API: ```route.fulfill```), ukrywanie (```mask: Locator[]```), stabilizowanie przed wykonaniem screenshotu (```domStability.ts``` helper), snapshot konkretnych elementów (```expect(sidebar).toHaveScreenshot('sidebar.png')```)

5. Ograniczenie wpływu animacji (Deterministyczne środowisko) - W razie potrzeby animacje mogą być wyłączane (```animations: "disabled"```)

6. Zastosowanie metody minimalizującej liczbę fałszywie pozytywnych wyników poprzez racjonalne (0.002) użycie opcji .toHaveScreenshot({ maxDiffPixelRatio: 0.02 }).

### Goal
Osiągnięcie deterministycznego, powtarzalnego renderu UI przed wykonaniem zrzutu ekranu, tak aby testy wizualne wykrywały wyłącznie realne błędy w interfejsie.

___

## Run Guidelines
### Dwa tryby pracy
**Lokalnie**
  ```sh
  npm run test:vrt
  ```

**Przeglądarka z Dockera (deterministyczny VRT)**
http://localhost:9292 → Running (Remote Chromium browser server - przeglądarka jako usługa w kontenerze Linux
i wystawił ją jako WebSocket API dla Playwright.)
  ```sh
  npm run docker:build
  npm run docker:run 
  ```

Uruchom test:
  ```sh
  npm run test:vrt
  ```
  lub
  ```sh
  npx playwright test
  ```

___

## Architektura

![alt text](arch.png)