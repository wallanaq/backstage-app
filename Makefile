# Infrastructure of the Backstage lab, on the local OrbStack Kubernetes.
#
# Recreate it from scratch in this order:
#
#   1. make istio      Istio in ambient mode, Gateway API and the shared Gateway
#                      "istio-gateway" (HTTP on *.k8s.orb.local, TCP on 5432)
#   2. make postgres   CloudNativePG and the shared Postgres cluster
#                      (runs "istio" first)
#
# Every variable can be overridden: make istio ISTIO_VERSION=1.31.2
# Manifests and settings live in infra/<component>/. Needs kubectl, istioctl and make.

SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c

# The cluster is always selected by name so that a different current context is never touched.
KUBE_CONTEXT ?= orbstack
KUBECTL ?= kubectl --context $(KUBE_CONTEXT)

# Istio (ambient), installed with istioctl: the local binary must be this version.
ISTIO_VERSION ?= 1.31.1
ISTIOCTL ?= istioctl --context $(KUBE_CONTEXT)
# The manifests in infra/ (Gateway, TCPRoute) assume istio-system.
ISTIO_NAMESPACE ?= istio-system
# The Kubernetes Gateway API. The experimental bundle is needed for TCPRoute.
GATEWAY_API_VERSION ?= v1.6.3
GATEWAY_API_URL ?= https://github.com/kubernetes-sigs/gateway-api/releases/download/$(GATEWAY_API_VERSION)/experimental-install.yaml

# CloudNativePG: the version is in infra/postgres/operator/kustomization.yaml.
CNPG_NAMESPACE ?= cnpg-system

ROLLOUT_TIMEOUT ?= 5m

.DEFAULT_GOAL := help
.PHONY: help istio postgres

help: ## List the targets and the variables that can be overridden
	@echo "Targets:"
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | sed -E 's/^([a-z-]+):.*## (.*)/  \1\t\2/' | expand -t 12
	@echo
	@echo "Variables (current values):"
	@echo "  KUBE_CONTEXT=$(KUBE_CONTEXT)"
	@echo "  ISTIO_VERSION=$(ISTIO_VERSION)  GATEWAY_API_VERSION=$(GATEWAY_API_VERSION)"
	@echo "  ROLLOUT_TIMEOUT=$(ROLLOUT_TIMEOUT)"

istio: ## Install Istio (ambient), the Gateway API CRDs and the Gateway istio-gateway
	@v="$$(istioctl version --remote=false 2>/dev/null | sed -n 's/^client version: //p')"; \
	if [ "$$v" != "$(ISTIO_VERSION)" ]; then \
		echo "istioctl is '$$v' but ISTIO_VERSION is $(ISTIO_VERSION): install that version of istioctl (or set ISTIO_VERSION)" >&2; exit 1; \
	fi
	@echo ">> Gateway API $(GATEWAY_API_VERSION) (experimental bundle: HTTPRoute and TCPRoute)"
	$(KUBECTL) apply --server-side -f $(GATEWAY_API_URL)
	$(KUBECTL) wait --for=condition=Established --timeout=60s \
		crd/gateways.gateway.networking.k8s.io \
		crd/httproutes.gateway.networking.k8s.io \
		crd/tcproutes.gateway.networking.k8s.io
	@echo ">> Istio $(ISTIO_VERSION) (ambient)"
	$(ISTIOCTL) install -f infra/istio/operator.yaml -y
	@echo ">> Gateway istio-gateway"
	$(KUBECTL) apply -f infra/istio/gateway.yaml
	$(KUBECTL) wait --for=condition=Programmed --timeout=180s \
		gateway/istio-gateway --namespace $(ISTIO_NAMESPACE)
	$(KUBECTL) get gateway istio-gateway --namespace $(ISTIO_NAMESPACE)

postgres: istio ## Install CloudNativePG and the shared Postgres cluster (exposed by TCPRoute)
	@echo ">> CloudNativePG operator"
	$(KUBECTL) apply --server-side --force-conflicts -k infra/postgres/operator
	$(KUBECTL) rollout status deployment/cnpg-controller-manager --namespace $(CNPG_NAMESPACE) --timeout=$(ROLLOUT_TIMEOUT)
	@echo ">> Postgres cluster"
	$(KUBECTL) apply -f infra/postgres/cluster.yaml
	$(KUBECTL) wait --for=condition=Ready --timeout=300s cluster/postgres --namespace postgres
	$(KUBECTL) apply -f infra/postgres/tcproute.yaml
	@echo "Postgres: postgres-rw.postgres.svc.cluster.local:5432 (cluster), postgres.k8s.orb.local:5432 (host)"
