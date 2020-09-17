FROM jboss/wildfly
#FROM imixs/wildfly:1.2.9

LABEL description="Imixs-Office-Workflow"
LABEL maintainer="ralph.soika@imixs.com"

# Copy EclipseLink
COPY ./docker/configuration/wildfly/modules/ /opt/jboss/wildfly/modules/


# Setup configuration
COPY ./docker/configuration/wildfly/imixsrealm.properties /opt/jboss/wildfly/standalone/configuration/
COPY ./docker/configuration/wildfly/standalone.xml /opt/jboss/wildfly/standalone/configuration/


# Deploy artefact
ADD ./imixs-office-workflow-app/target/imixs-office-workflow*.war /opt/jboss/wildfly/standalone/deployments/
