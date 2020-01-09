import os
import io
import boto3
import json
import csv


# grab environment variables
ENDPOINT_NAME = os.environ['ENDPOINT_NAME']
runtime= boto3.client('runtime.sagemaker')

def lambda_handler(event, context):
    #print("Received event: " + json.dumps(event, indent=2))
    
    data = json.loads(json.dumps(event))
    payload = data['data']
    print("PAYLOAD: ", payload)
    
    response = runtime.invoke_endpoint(EndpointName=ENDPOINT_NAME,
                                       ContentType='application/json',
                                       Body=payload)
    print(response)
    result = json.loads(response['Body'].read().decode())

    pred = max(result[0])
    predicted_label = result[0].index(pred)
    
    return predicted_label

