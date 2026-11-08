FROM golang:1.26.5-alpine AS build
# hadolint global ignore=DL3059
WORKDIR /src
COPY go.mod go.sum ./
COPY *.go ./
COPY catalog ./catalog
COPY models ./models
COPY migrations ./migrations
RUN CGO_ENABLED=0 go build -o /atelier-backend .

FROM alpine:3.22

RUN adduser -D -H -u 10001 appuser
COPY --from=build /atelier-backend /atelier-backend
USER appuser
ENV TRUST_PROXY=true
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://localhost:8080/health || exit 1
ENTRYPOINT ["/atelier-backend"]
