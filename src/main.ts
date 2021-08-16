import EmployeeService from "./services/employee-service";

const employeeService = new EmployeeService();
function createResponse(statusCd: any, body: any) {
  return  {
    statusCode: statusCd,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Max-Age': '3600',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,HEAD,OPTIONS'
    },
    body: JSON.stringify(body),
  };
}
export async function createEmployee(event, context, callback){
  const result = await employeeService.createEmployee(JSON.parse(event.body));
  callback(null, createResponse(200, result));
}

export async function getEmployeeById(event, context, callback){
  const result: any = await employeeService.getEmployeeById(event.pathParameters.id);
  callback(null, createResponse(result.status, result.data));


}

export async function getEmployees(event, context, callback){
  const result: any = await employeeService.getEmployees();
  callback(null, createResponse(result.status, result.data));

}

export async function updateEmployee(event, context, callback){
  const result: any = await employeeService.updateEmployee(event.pathParameters.id, JSON.parse(event.body));
  callback(null, createResponse(result.status, result.data));

}
export async function deleteEmployee(event, context, callback){
  const result: any = await employeeService.deleteEmployee(event.pathParameters.id);
  callback(null, createResponse(result.status, result.data));

}
