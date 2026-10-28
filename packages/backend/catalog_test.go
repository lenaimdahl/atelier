package main

import (
	"context"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"
)

func TestCatalogFile(t *testing.T) {
	entries, err := parseCatalog(catalogFile)
	if err != nil {
		t.Fatal(err)
	}

	workID := regexp.MustCompile(`^OL[0-9]+W$`)
	seen := map[string]bool{}
	perLanguage := map[string]int{}
	for _, entry := range entries {
		if !workID.MatchString(entry.id) {
			t.Errorf("%q is not an Open Library work ID", entry.id)
		}
		if seen[entry.id] {
			t.Errorf("%s is listed twice", entry.id)
		}
		seen[entry.id] = true
		perLanguage[string(entry.language)]++
	}

	if perLanguage["en"] != 50 || perLanguage["de"] != 50 {
		t.Errorf("expected 50 English and 50 German books, got %v", perLanguage)
	}
}

func TestParseCatalog(t *testing.T) {
	entries, err := parseCatalog("# comment\n\nOL1W de Die Wand | Marlen Haushofer\nOL2W en Ain't I a Woman?\n")
	if err != nil {
		t.Fatal(err)
	}
	if len(entries) != 2 {
		t.Fatalf("expected 2 entries, got %d", len(entries))
	}
	if entries[0] != (catalogEntry{id: "OL1W", language: "de", title: "Die Wand"}) {
		t.Errorf("unexpected first entry: %+v", entries[0])
	}
	if entries[1].title != "Ain't I a Woman?" {
		t.Errorf("unexpected title: %q", entries[1].title)
	}

	for _, line := range []string{"OL1W fr Le Livre", "OL1W en"} {
		if _, err := parseCatalog(line); err == nil {
			t.Errorf("expected an error for %q", line)
		}
	}
}

func TestParseOpenLibraryWorks(t *testing.T) {
	body := []byte(`{"docs": [
		{"key": "/works/OL675783W", "author_name": ["Margaret Atwood"], "cover_i": 8231851},
		{"key": "/works/OL3494194W", "author_name": ["Verena Stefan", "Tobe Levin"]}
	]}`)

	works, err := parseOpenLibraryWorks(body)
	if err != nil {
		t.Fatal(err)
	}
	if len(works) != 2 {
		t.Fatalf("expected 2 works, got %d", len(works))
	}
	if works["OL675783W"].CoverID != 8231851 || works["OL675783W"].AuthorName[0] != "Margaret Atwood" {
		t.Errorf("unexpected work: %+v", works["OL675783W"])
	}
	if works["OL3494194W"].CoverID != 0 {
		t.Errorf("expected no cover, got %d", works["OL3494194W"].CoverID)
	}
}

func TestDownloadRejectsLargeResponses(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(response http.ResponseWriter, _ *http.Request) {
		_, _ = response.Write(make([]byte, 2048))
	}))
	defer server.Close()

	if _, err := download(context.Background(), server.Client(), server.URL, 2048); err != nil {
		t.Errorf("expected a response of exactly the limit to pass, got %v", err)
	}
	if _, err := download(context.Background(), server.Client(), server.URL, 1024); err == nil {
		t.Error("expected a response over the limit to fail")
	}
}

func TestSearchCatalogRejectsInvalidInput(t *testing.T) {
	handler := searchCatalogHandler(nil, "http://localhost:5173")
	for _, target := range []string{"/catalog?language=fr", "/catalog?q=" + strings.Repeat("a", maxSearchLength+1)} {
		response := httptest.NewRecorder()
		handler(response, httptest.NewRequest(http.MethodGet, target, nil))
		if response.Code != http.StatusBadRequest {
			t.Errorf("%s: expected 400, got %d", target, response.Code)
		}
	}
}
