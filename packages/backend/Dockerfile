FROM golang:1.26.5-alpine AS build
# hadolint global ignore=DL3059
WORKDIR /src
COPY go.mod ./ go.sum ./
COPY main.go ./
COPY migrations ./migrations
RUN CGO_ENABLED=0 go build -o /atelier-backend .

FROM alpine:3.22

# hadolint ignore=DL3018
RUN apk add --no-cache curl
RUN adduser -D -H -u 10001 appuser
COPY --from=build /atelier-backend /atelier-backend
USER appuser
EXPOSE 8080
ENTRYPOINT ["/atelier-backend"]
