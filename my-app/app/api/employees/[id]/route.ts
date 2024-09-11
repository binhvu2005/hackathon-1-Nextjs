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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const employees = readEmployeesFromFile();
  const employee = employees.find((emp: any) => emp.id === parseInt(params.id));

  return employee
    ? NextResponse.json(employee)
    : NextResponse.json({ message: 'Không tìm thấy nhân viên' }, { status: 404 });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const updatedEmployee = await request.json();
    const employees = readEmployeesFromFile();
    const employeeIndex = employees.findIndex((emp: any) => emp.id === parseInt(params.id));

    if (employeeIndex === -1) {
      return NextResponse.json({ message: 'Không tìm thấy nhân viên' }, { status: 404 });
    }

    employees[employeeIndex] = { ...employees[employeeIndex], ...updatedEmployee };
    writeEmployeesToFile(employees);

    return NextResponse.json({ message: 'Cập nhật nhân viên thành công' });
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi khi cập nhật nhân viên' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const employees = readEmployeesFromFile();
    const filteredEmployees = employees.filter((emp: any) => emp.id !== parseInt(params.id));

    if (filteredEmployees.length === employees.length) {
      return NextResponse.json({ message: 'Không tìm thấy nhân viên' }, { status: 404 });
    }

    writeEmployeesToFile(filteredEmployees);

    return NextResponse.json({ message: 'Xóa nhân viên thành công' });
  } catch (error) {
    return NextResponse.json({ message: 'Lỗi khi xóa nhân viên' }, { status: 500 });
  }
}
