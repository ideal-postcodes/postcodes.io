@description('Specifies the name of the container app environment.')
param containerAppEnvName string = 'containerapp-env-${uniqueString(resourceGroup().id)}'

@description('Specifies the name of the log analytics workspace.')
param containerAppLogAnalyticsName string = 'containerapp-log-${uniqueString(resourceGroup().id)}'

@description('Specifies the location for all resources.')
param location string = resourceGroup().location

@description('Minimum number of replicas that will be deployed')
@minValue(0)
@maxValue(25)
param minReplica int = 1

@description('Maximum number of replicas that will be deployed')
@minValue(0)
@maxValue(25)
param maxReplica int = 3

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2021-06-01' = {
  name: containerAppLogAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
  }
}
resource containerAppEnv 'Microsoft.App/managedEnvironments@2022-03-01' = {
  name: containerAppEnvName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }

}

resource postcodesioApp 'Microsoft.App/containerApps@2022-03-01' = {
  name: 'postcodesio-app'
  location: location
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8000
        allowInsecure: false
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
      }
    }
    template: {
      containers: [
        {
          name: 'postcodesio'
          image: 'idealpostcodes/postcodes.io:latest'
          env: [
            {
              name: 'POSTGRES_HOST'
              value: 'localhost'
            }
            {
              name: 'POSTGRES_DATABASE'
              value: 'postcodesiodb'
            }
            { 
              name: 'POSTGRES_USER'
              value: 'postcodesio'
            }
            {
              name: 'POSTGRES_PASSWORD'
              value: 'secret'
            }
          ]
          resources: {
            cpu: json('.25')
            memory: '.5Gi'
          }
          probes: [
            {
              type: 'liveness'
              httpGet: {
                path: '/ping'
                port: 8000
                httpHeaders: [
                  {
                    name: 'Custom-Header'
                    value: 'liveness probe'
                  }
                ]
              }
              initialDelaySeconds: 7
              periodSeconds: 10
            }
            {
              type: 'readiness'
              httpGet: {
                path: '/postcodes/EC2A4PH'
                port: 8000
                httpHeaders: [
                  {
                    name: 'Custom-Header'
                    value: 'readiness probe'
                  }
                ]
              }
              initialDelaySeconds: 3
              periodSeconds: 10
            }
          ]
        }
        {
          name: 'postcodesiodb'
          image: 'idealpostcodes/postcodes.io.db:latest'
          env: [
            {
              name: 'POSTGRES_DB'
              value: 'postcodesiodb'
            }
            { 
              name: 'POSTGRES_USER'
              value: 'postcodesio'
            }
            {
              name: 'POSTGRES_PASSWORD'
              value: 'secret'
            }
          ]
          resources: {
            cpu: json('.25')
            memory: '.5Gi'
          }
        }
      ]
      scale: {
        minReplicas: minReplica
        maxReplicas: maxReplica
        rules: [
          {
            name: 'http-requests'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
}

output postcodesioAppFQDN string = postcodesioApp.properties.configuration.ingress.fqdn
