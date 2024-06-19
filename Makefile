PRODUCT?=direct
NAMESPACE?=${PRODUCT}-${ENV}-${PLANT}
STATUS_ENDPOINT?=/status
DEFAULT_DOMAIN_NAME?=${APP}.${ENV}.${PLANT}.${PRODUCT}.k8s.local
SHELL := /bin/bash -x
jobTimeout?=10m
checkSleepTime?=5
checkMaxSleeps?=4

.PHONY: deploy
deploy:
	@kubectl delete configmap ${APP} -n ${NAMESPACE} 2>/dev/null && sleep 1 || true
	@kubectl create configmap ${APP} -n ${NAMESPACE} --from-file=env.properties=${CONF} && sleep 1
	for yaml in ${K8SCONF}/*.yml; do \
        kubectl apply -n ${NAMESPACE} -f $$yaml ; \
   done

.PHONY: check
check:
	@kubectl -n ${NAMESPACE} rollout status deployment/${APP} --timeout=${jobTimeout}
	@./k8s/check.sh ${DEFAULT_DOMAIN_NAME} ${VERSION} ${STATUS_ENDPOINT} ${checkSleepTime} ${checkMaxSleeps}

