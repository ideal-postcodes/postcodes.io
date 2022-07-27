# Setup

Login to Azure

    az login

Next, install the Azure Container Apps extension for the CLI.

    az extension add --name containerapp --upgrade

Register the Microsoft.App namespace

    az provider register --namespace Microsoft.App

Register the Microsoft.OperationalInsights provider for the Azure Monitor Log
Analytics Workspace if you have not used it before.

    az provider register --namespace Microsoft.OperationalInsights

Next, set the following environment variables:

    RESOURCE_GROUP="my-container-apps"
    LOCATION="australiaeast"
    CONTAINERAPPS_ENVIRONMENT="my-environment"

Create the resource group under which you will deploy to.

    az group create \
        --name $RESOURCE_GROUP \
        --location $LOCATION

# Deploy

Deploy the Postcodes IO containers

    az deployment group create \
        --resource-group $RESOURCE_GROUP \
        --template-file main.bicep \
        --query properties.outputs

The app takes a while to come up as it has to load the postcode data into the
postgres database. 

To open a browser to the postcodesio app

    az containerapp browse --name postcodesio-app