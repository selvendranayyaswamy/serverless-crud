import * as AWS from "aws-sdk";

export default class EmployeeService {
  protected readonly documentClient: any;
  private readonly tableName: string;
  private readonly region: string

  // Get the DynamoDB Client as per the configuration.
  private getDynamoDbClient(): any {
    // This is to support local testing with dynalite.
    if (process.env.ENVIRONMENT === 'local') {
      return new AWS.DynamoDB.DocumentClient({
        region: 'us-east-1',
        endpoint: 'http://localhost:8000'
      });
    } else {
      return new AWS.DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        region: process.env.REGION
      });
    }
  }

  constructor() {
    this.documentClient = this.getDynamoDbClient();
    this.tableName = process.env.DYNAMODB_TABLE_NAME;
    this.region = process.env.REGION;
  }

  public async createEmployee(employee) {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: { pk: 'EMPLOYEE', sk: employee.id, value: employee }
    };
    return new Promise((resolve, reject) => {
      return this.documentClient.put(params, (error, data) => {
        if (error) {
          console.log(error);
          reject({ message: error.message });
        } else {
          resolve({ message: 'Employee Created ' });
        }
      });
    });
  }

  public async getEmployeeById(id) {
    const readParams = {
      TableName: this.tableName,
      Key: {
        pk: 'EMPLOYEE',
        sk: id
      }
    };
    return new Promise((resolve, reject) => {
      return this.documentClient.get(readParams, (error, data) => {
        if (error) {
          console.log(error);
          reject(error.message);
        } else if (!data.Item) {
          resolve({ status: 404, data: "Employee Not Found" });
        } else {
          resolve({ status: 200, data: data.Item.value });
        }
      });
    });

  }

  public getEmployees() {
    const readParams = {
      TableName: this.tableName,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": 'EMPLOYEE'
      }
    };
    return new Promise((resolve, reject) => {
      return this.documentClient.query(readParams, (error, data) => {
        if (error) {
          console.log(error);
          reject(error.message);
        } else if (data.Items.length < 1) {
          resolve({ status: 404, data: "Employee Not Found" });
        } else {
          resolve({ status: 200, data: data.Items.map(e => e.value) });
        }
      });
    });

  }

  public async updateEmployee(id, employee) {
    const updateParams = {
      TableName: this.tableName,
      Key: {
        pk: 'EMPLOYEE',
        sk: id
      },
      UpdateExpression: 'SET #value = :employee',
      ConditionExpression: 'pk = :pk and sk = :sk',
      ExpressionAttributeNames: {
        '#value': 'value'
      },
      ExpressionAttributeValues: {
        ':pk': 'EMPLOYEE',
        ':sk': id,
        ':employee': employee
      },
      ReturnValues: 'ALL_OLD'
    };
    return new Promise((resolve, reject) => {
      return this.documentClient.update(updateParams, (error, data) => {
        if (error) { // Reject
          console.log(error);
          resolve({ status: 404, data: `Employee ${id} cannot be updated` });
        } else { // Resolve
          resolve({ status: 200, data: `Employee ${id} updated successfully` });
        }
      });
    });


  }

  public async deleteEmployee(id) {
    const keyParams = {
      TableName: this.tableName,
      Key: {
        pk: 'EMPLOYEE',
        sk: id
      },
      ReturnValues: "ALL_OLD"

    };
    return new Promise((resolve, reject) => {
      return this.documentClient.delete(keyParams, (error, data) => {
        if (error) {
          console.log(error);
          reject(error.message);
        } else if (!data.Attributes) {
          resolve({ status: 404, data: `Employee ${id} Not Found` });
        } else {
          resolve({ status: 200, data: `Employee ${id} Deleted Successfully` });
        }
      });
    });

  }
}
