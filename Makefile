# Infrastructure of the Backstage lab, on the local OrbStack Kubernetes.
#
# Recreate it from scratch in this order:
#
#   1. make istio      Istio in ambient mode, Gateway API and the shared Gateway
#                      "istio-gateway" (HTTP on *.k8s.orb.local, TCP on 5432)
#   2. make postgres   CloudNativePG and the shared Postgres cluster
#                      (runs "istio" first)
#
# Every variable can be overridden: make postgres CNPG_CHART_VERSION=0.29.0
# Manifests and chart values live in infra/<component>/.

SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c

# The cluster is always selected by name so that a different current context is never touched.
KUBE_CONTEXT ?= orbstack
KUBECTL ?= kubectl --context $(KUBE_CONTEXT)
HELM ?= helm --kube-context $(KUBE_CONTEXT)
HELM_TIMEOUT ?= 5m

# Istio (ambient) and the Kubernetes Gateway API. The experimental bundle is needed for TCPRoute.
ISTIO_VERSION ?= 1.30.5
ISTIO_REPO ?= https://istio-release.storage.googleapis.com/charts
# The manifests in infra/ (Gateway, TCPRoute) assume istio-system.
ISTIO_NAMESPACE ?= istio-system
GATEWAY_API_VERSION ?= v1.6.3
GATEWAY_API_URL ?= https://github.com/kubernetes-sigs/gateway-api/releases/download/$(GATEWAY_API_VERSION)/experimental-install.yaml

# CloudNativePG.
CNPG_CHART_VERSION ?= 0.29.1
CNPG_REPO ?= https://cloudnative-pg.github.io/charts
CNPG_NAMESPACE ?= cnpg-system

HELM_INSTALL = $(HELM) upgrade --install --wait --rollback-on-failure --timeout $(HELM_TIMEOUT)

.DEFAULT_GOAL := help
.PHONY: help istio postgres

help: ## List the targets and the variables that can be overridden
	@echo "Targets:"
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | sed -E 's/^([a-z-]+):.*## (.*)/  \1\t\2/' | expand -t 12
	@echo
	@echo "Variables (current values):"
	@echo "  KUBE_CONTEXT=$(KUBE_CONTEXT)"
	@echo "  ISTIO_VERSION=$(ISTIO_VERSION)  GATEWAY_API_VERSION=$(GATEWAY_API_VERSION)"
	@echo "  CNPG_CHART_VERSION=$(CNPG_CHART_VERSION)  HELM_TIMEOUT=$(HELM_TIMEOUT)"

istio: ## Install Istio (ambient), the Gateway API CRDs and the Gateway istio-gateway
	@echo ">> Gateway API $(GATEWAY_API_VERSION) (experimental bundle: HTTPRoute and TCPRoute)"
	$(KUBECTL) apply --server-side -f $(GATEWAY_API_URL)
	$(KUBECTL) wait --for=condition=Established --timeout=60s \
		crd/gateways.gateway.networking.k8s.io \
		crd/httproutes.gateway.networking.k8s.io \
		crd/tcproutes.gateway.networking.k8s.io
	@echo ">> Istio $(ISTIO_VERSION) (ambient)"
	$(HELM) repo add istio $(ISTIO_REPO) --force-update
	$(HELM) repo update istio
	$(HELM_INSTALL) istio-base istio/base --version $(ISTIO_VERSION) \
		--namespace $(ISTIO_NAMESPACE) --create-namespace
	$(HELM_INSTALL) istiod istio/istiod --version $(ISTIO_VERSION) \
		--namespace $(ISTIO_NAMESPACE) -f infra/istio/istiod-values.yaml
	$(HELM_INSTALL) istio-cni istio/cni --version $(ISTIO_VERSION) \
		--namespace $(ISTIO_NAMESPACE) -f infra/istio/cni-values.yaml
	$(HELM_INSTALL) ztunnel istio/ztunnel --version $(ISTIO_VERSION) \
		--namespace $(ISTIO_NAMESPACE) -f infra/istio/ztunnel-values.yaml
	@echo ">> Gateway istio-gateway"
	$(KUBECTL) apply -f infra/istio/gateway.yaml
	$(KUBECTL) wait --for=condition=Programmed --timeout=180s \
		gateway/istio-gateway --namespace $(ISTIO_NAMESPACE)
	$(KUBECTL) get gateway istio-gateway --namespace $(ISTIO_NAMESPACE)

postgres: istio ## Install CloudNativePG and the shared Postgres cluster (exposed by TCPRoute)
	@echo ">> CloudNativePG chart $(CNPG_CHART_VERSION)"
	$(HELM) repo add cloudnative-pg $(CNPG_REPO) --force-update
	$(HELM) repo update cloudnative-pg
	$(HELM_INSTALL) cnpg cloudnative-pg/cloudnative-pg --version $(CNPG_CHART_VERSION) \
		--namespace $(CNPG_NAMESPACE) --create-namespace -f infra/postgres/cnpg-values.yaml
	@echo ">> Postgres cluster"
	$(KUBECTL) apply -f infra/postgres/cluster.yaml
	$(KUBECTL) wait --for=condition=Ready --timeout=300s cluster/postgres --namespace postgres
	$(KUBECTL) apply -f infra/postgres/tcproute.yaml
	@echo "Postgres: postgres-rw.postgres.svc.cluster.local:5432 (cluster), postgres.k8s.orb.local:5432 (host)"
