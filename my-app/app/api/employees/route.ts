import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), '/data/employees.json');

function readEmployeesFromFile() {
  const fileData = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileData);
}

function writeEmployeesToFile(employees: any) {
  fs.writeFileSync(filePath, JSON.stringify(employees, null, 2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  const employees = readEmployeesFromFile();

  if (email) {
    const employee = employees.find((emp: any) => emp.email === email);
    return employee
      ? NextResponse.json(employee)
      : NextResponse.json({ message: 'Không tìm thấy nhân viên' }, { status: 404 });
  }

  return NextResponse.json(employees);
}

export async function POST(request: Request) {
  try {
    const newEmployee = await request.json();
    const employees = readEmployeesFromFile();

    const newId = employees.length > 0 ? employees[employees.length - 1].id + 1 : 1;
    const employeeToAdd = { id: newId, ...newEmployee };
    employees.push(employeeToAdd);

    writeEmployeesToFile(employees);

    return NextResponse.json({
      message: 'Thêm mới nhân viên thành công',
    });
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi khi thêm nhân viên mới' }, { status: 500 });
  }
}