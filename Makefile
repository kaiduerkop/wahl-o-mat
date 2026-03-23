TAG     := $(shell git describe --tags --abbrev=0 2>/dev/null | sed 's/^v//' || echo "0.0.0")
DEV_TAG := $(TAG)-dev
IMAGE   := ghcr.io/kaiduerkop/wahl-o-mat

.PHONY: dev-release

dev-release:
	@echo "Current tag:    $(TAG)"
	@echo "Image:          $(IMAGE):$(DEV_TAG)"
	@echo ""
	docker build -t $(IMAGE):$(DEV_TAG) .
	docker push $(IMAGE):$(DEV_TAG)
	@echo ""
	@echo "Done: $(IMAGE):$(DEV_TAG) pushed to ghcr.io."
