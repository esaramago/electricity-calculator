FROM alpine:3.20

ARG PB_VERSION=0.40.4

RUN apk add --no-cache \
    unzip \
    ca-certificates \
    wget

# Download and install PocketBase
RUN wget -q https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip -O /tmp/pb.zip \
    && mkdir -p /pb \
    && unzip /tmp/pb.zip -d /pb \
    && rm /tmp/pb.zip \
    && chmod +x /pb/pocketbase

# Copy migrations
COPY pb_migrations /pb/pb_migrations

EXPOSE 8090

VOLUME ["/pb/pb_data"]

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data"]
