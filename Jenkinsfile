#!groovy
/* Expected injected variables:
- APP
- ENV
- PLANT
- VERSION
- K8SCONFIG
for partial ConfigMap update:
- COMPONENTS
==============================
Needed plugins:
- Pipeline Utility Steps
==============================
*/

timestamps {
    try {
        node ('kubectl') {
            stage ('Checkout') {
                checkout scm
                currentBuild.displayName = "#${env.BUILD_ID} - ${APP}.${ENV}.${PLANT} - ${VERSION}"
            }
            stage ('Deploy') {
                withEnv(["VERSION=${VERSION}","APP=${APP}", "CONF=${CONF}", "K8SCONF=${K8SCONF}", "ENV=${ENV}", "PLANT=$PLANT" ]) {
                    sh "make deploy check"
                }
            }
        }
    } catch (e) {
        currentBuild.result = 'FAILURE'
        throw e
    } finally {
        def state = currentBuild.result ?: 'SUCCESS'
    }
}
