package main

import (
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

func TestClientIP(t *testing.T) {
	request := httptest.NewRequest(http.MethodPost, "/favorites", nil)
	request.RemoteAddr = "10.0.0.1:1234"
	if got := clientIP(request); got != "10.0.0.1" {
		t.Errorf("expected remote address, got %q", got)
	}

	request.Header.Set("X-Forwarded-For", "1.1.1.1, 203.0.113.7")
	if got := clientIP(request); got != "203.0.113.7" {
		t.Errorf("expected the entry added by the proxy, got %q", got)
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
			handler := addFavoriteHandler(nil, "http://localhost:5173", newRateLimiter(100, time.Minute))
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
	handler := addFavoriteHandler(nil, "http://localhost:5173", newRateLimiter(1, time.Minute))

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
