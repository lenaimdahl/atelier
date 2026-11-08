package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestRateLimiter(t *testing.T) {
	limiter := newRateLimiter(2, time.Minute)
	now := time.Now()

	if !limiter.allow("a", now) || !limiter.allow("a", now) {
		t.Fatal("expected the first two requests to be allowed")
	}
	if limiter.allow("a", now) {
		t.Error("expected the third request within the window to be blocked")
	}
	if !limiter.allow("b", now) {
		t.Error("expected another client to be allowed")
	}
	if !limiter.allow("a", now.Add(time.Minute)) {
		t.Error("expected a new window to allow requests again")
	}
}

func TestRateLimiterKeepsActiveClientsWhenFull(t *testing.T) {
	limiter := newRateLimiter(1, time.Minute)
	now := time.Now()

	limiter.allow("victim", now)
	for i := range maxTrackedClients {
		limiter.allow(fmt.Sprint("attacker-", i), now)
	}
	if limiter.allow("victim", now) {
		t.Error("expected filling the table not to reset the limit of an active client")
	}
	if limiter.allow("newcomer", now) {
		t.Error("expected new clients to be refused while the table is full")
	}
	if !limiter.allow("newcomer", now.Add(time.Minute)) {
		t.Error("expected expired windows to be dropped to make room")
	}
}

func TestClientKey(t *testing.T) {
	request := httptest.NewRequest(http.MethodPost, "/favorites", nil)
	request.RemoteAddr = "10.0.0.1:1234"
	request.Header.Set("X-Forwarded-For", "1.1.1.1, 203.0.113.7")

	if got := clientKey(request, false); got != "10.0.0.1" {
		t.Errorf("expected X-Forwarded-For to be ignored without a trusted proxy, got %q", got)
	}
	if got := clientKey(request, true); got != "203.0.113.7" {
		t.Errorf("expected the entry added by the proxy, got %q", got)
	}

	request.Header.Set("X-Forwarded-For", "2001:db8:1:2:aaaa::1")
	other := httptest.NewRequest(http.MethodPost, "/favorites", nil)
	other.Header.Set("X-Forwarded-For", "2001:db8:1:2:bbbb::9")
	if clientKey(request, true) != clientKey(other, true) {
		t.Error("expected IPv6 addresses in the same /64 to share a key")
	}
}

func TestAddFavoriteRejectsBeforeDatabase(t *testing.T) {
	tests := map[string]struct {
		contentType string
		body        string
		want        int
	}{
		"text/plain is rejected":   {"text/plain", `{"bookId":"OL1W"}`, http.StatusUnsupportedMediaType},
		"missing bookId":           {"application/json", `{}`, http.StatusBadRequest},
		"invalid json":             {"application/json; charset=utf-8", `{`, http.StatusBadRequest},
		"body over the size limit": {"application/json", `{"bookId":"` + strings.Repeat("A", maxFavoriteBodyBytes) + `"}`, http.StatusBadRequest},
	}

	for name, test := range tests {
		t.Run(name, func(t *testing.T) {
			handler := addFavoriteHandler(nil, "http://localhost:5173", newRateLimiter(100, time.Minute), false)
			request := httptest.NewRequest(http.MethodPost, "/favorites", strings.NewReader(test.body))
			request.Header.Set("Content-Type", test.contentType)
			response := httptest.NewRecorder()

			handler(response, request)

			if response.Code != test.want {
				t.Errorf("expected %d, got %d", test.want, response.Code)
			}
		})
	}
}

func TestAddFavoriteRateLimit(t *testing.T) {
	handler := addFavoriteHandler(nil, "http://localhost:5173", newRateLimiter(1, time.Minute), false)

	var codes []int
	for range 2 {
		request := httptest.NewRequest(http.MethodPost, "/favorites", strings.NewReader(`{}`))
		request.Header.Set("Content-Type", "application/json")
		response := httptest.NewRecorder()
		handler(response, request)
		codes = append(codes, response.Code)
	}

	if codes[0] != http.StatusBadRequest || codes[1] != http.StatusTooManyRequests {
		t.Errorf("expected 400 then 429, got %v", codes)
	}
}
