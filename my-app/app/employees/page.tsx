"use client"
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Swal from 'sweetalert2';

interface Employee {
  id: number;
  name: string;
  dob: string;
  email: string;
  image: string;
}

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, 'id'>>({
    name: '',
    dob: '',
    email: '',
    image: '',
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editEmployeeId, setEditEmployeeId] = useState<number | null>(null);
const getData = ()=> {

    fetch("http://localhost:3000/api/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data));

}
getData();
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const url = isEditing ? `/api/employees/${editEmployeeId}` : '/api/employees';
      const method = isEditing ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmployee),
      });

      if (response.ok) {
        const updatedEmployee: Employee = await response.json();
        if (isEditing) {
          setEmployees(employees.map(emp => emp.id === editEmployeeId ? updatedEmployee : emp));
          setIsEditing(false);
          setEditEmployeeId(null);
          Swal.fire('Cập nhật thành công!', 'Nhân viên đã được cập nhật.', 'success');
        } else {
          setEmployees(prevEmployees => [...prevEmployees, updatedEmployee]);
          Swal.fire('Thêm thành công!', 'Nhân viên mới đã được thêm.', 'success');
        }
        setNewEmployee({
          name: '',
          dob: '',
          email: '',
          image: '',
        });
      } else {
        console.error('Error:', response.statusText);
        Swal.fire('Lỗi', 'Có lỗi xảy ra khi lưu dữ liệu.', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Lỗi', 'Có lỗi xảy ra khi lưu dữ liệu.', 'error');
    }
    getData();
  };

  const validateForm = () => {
    if (!newEmployee.name || !newEmployee.dob || !newEmployee.email || !newEmployee.image) {
      Swal.fire('Vui lòng nhập đầy đủ thông tin');
      return false;
    }
    if (!isEditing && employees.some(emp => emp.email === newEmployee.email)) {
      Swal.fire('Email đã tồn tại');
      return false;
    }
    return true;
  };

  const handleEdit = (employee: Employee) => {
    setNewEmployee({
      name: employee.name,
      dob: employee.dob,
      email: employee.email,
      image: employee.image,
    });
    setIsEditing(true);
    setEditEmployeeId(employee.id);
    getData();
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      text: "Bạn có chắc chắn muốn xóa nhân viên này?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/employees/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setEmployees(employees.filter(emp => emp.id !== id));
          Swal.fire('Đã xóa!', 'Nhân viên đã được xóa.', 'success');
        } else {
          console.error('Error deleting employee:', response.statusText);
          Swal.fire('Lỗi', 'Có lỗi xảy ra khi xóa nhân viên.', 'error');
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        Swal.fire('Lỗi', 'Có lỗi xảy ra khi xóa nhân viên.', 'error');
      }
    }
    getData();
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">STT</th>
                <th className="border border-gray-300 p-2">Tên nhân viên</th>
                <th className="border border-gray-300 p-2">Ngày sinh</th>
                <th className="border border-gray-300 p-2">Hình ảnh</th>
                <th className="border border-gray-300 p-2">Email</th>
                <th className="border border-gray-300 p-2">Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <tr key={employee.id} className="text-center">
                  <td className="border border-gray-300 p-2">{index + 1}</td>
                  <td className="border border-gray-300 p-2">{employee.name}</td>
                  <td className="border border-gray-300 p-2">{employee.dob}</td>
                  <td className="border border-gray-300 p-2">
                    <img
                      src={employee.image}
                      alt={employee.name}
                      className="w-12 h-12 object-cover rounded-full mx-auto"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">{employee.email}</td>
                  <td className="border border-gray-300 p-2">
                    <button 
                      onClick={() => handleEdit(employee)} 
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded mr-2"
                    >
                      Sửa
                    </button>
                    <button 
                      onClick={() => handleDelete(employee.id)} 
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-span-4 bg-white p-4 shadow-md rounded">
          <h2 className="text-lg font-semibold mb-4">
            {isEditing ? 'Cập nhật nhân viên' : 'Thêm mới nhân viên'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Tên nhân viên</label>
              <input
                type="text"
                name="name"
                value={newEmployee.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Ngày sinh</label>
              <input
                type="date"
                name="dob"
                value={newEmployee.dob}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Hình ảnh</label>
              <input
                type="text"
                name="image"
                value={newEmployee.image}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={newEmployee.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <button type="submit" className="bg-blue-500 text-white w-full py-2 rounded">
              {isEditing ? 'Cập nhật' : 'Thêm'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
