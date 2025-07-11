'use client';

import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert, Typography } from 'antd'; // Using Ant Design components for consistency

const { Title } = Typography;

// Basic interface for student data (adjust based on actual API response)
interface Student {
  id: string | number; // Assuming 'id' or another unique field like 'email' will be available
  name: string;
  email: string;
  // Add other relevant fields based on the Zoho API response
  // e.g., Zoho_ID, Full_Name, Mobile, Gender, Date_of_Birth, Current_Status etc.
  // It's crucial to inspect the actual API response to populate this correctly.
  [key: string]: any; // Allow other properties
}

// The API URL is now internal, pointing to our Next.js API route
const INTERNAL_API_URL = '/api/ghar-students';

const StudentDetailsSection: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch from the internal API route
        const response = await fetch(INTERNAL_API_URL, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            // No Authorization header needed here, as it's handled by the API route
          },
        });

        const data = await response.json(); // Always try to parse JSON first

        if (!response.ok) {
          // 'data' might contain the error message from our API route if parsing was successful
          const errorMessage = data?.message || `Failed to fetch student data: ${response.status} ${response.statusText}`;
          console.error('API Error Data:', data);
          throw new Error(errorMessage);
        }

        console.log('Raw API Data (from internal route):', data); // Log raw data to inspect its structure

        // IMPORTANT: Adjust data mapping based on the actual API response structure
        // The API might return data directly as an array, or nested under a key like 'data', 'result', 'students' etc.
        // It might also not match the 'Student' interface directly.
        let studentList: Student[] = [];
        if (Array.isArray(data)) {
          studentList = data.map((item: any, index: number) => ({
            id: item.ID || item.id || item.Zoho_ID || `temp-id-${index}`, // Use a unique identifier, Zoho_ID or ID is common
            name: item.Full_Name || item.name || 'N/A',
            email: item.Email || item.email || 'N/A',
            // Map other fields here, ensuring they exist in 'item'
            ...item, // include all other fields from the item
          }));
        } else if (data && Array.isArray(data.data)) { // Example if data is under a 'data' key
           studentList = data.data.map((item: any, index: number) => ({
            id: item.ID || item.id || item.Zoho_ID || `temp-id-${index}`,
            name: item.Full_Name || item.name || 'N/A',
            email: item.Email || item.email || 'N/A',
            ...item,
          }));
        } else if (data && Array.isArray(data.students)) { // Example if data is under a 'students' key
           studentList = data.students.map((item: any, index: number) => ({
            id: item.ID || item.id || item.Zoho_ID || `temp-id-${index}`,
            name: item.Full_Name || item.name || 'N/A',
            email: item.Email || item.email || 'N/A',
            ...item,
          }));
        } else {
          // This case should ideally be handled by the API route returning an error if the external data is malformed.
          // However, adding a fallback here in the client is good for robustness.
          console.error('Unexpected API response structure from internal route:', data);
          setError(data?.message || 'Fetched data is not in the expected format.');
        }
        setStudents(studentList);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  // Define columns for the Ant Design Table
  // These should be dynamically generated or adjusted based on the keys in the student data
  // For now, let's assume some common fields.
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Student, b: Student) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a: Student, b: Student) => (a.email || '').localeCompare(b.email || ''),
    },
    // Add more columns as needed based on the actual data you want to display
    // Example:
    // {
    //   title: 'Zoho ID',
    //   dataIndex: 'Zoho_ID', // Ensure this key exists in your transformed student objects
    //   key: 'Zoho_ID',
    // },
    // {
    //   title: 'Mobile',
    //   dataIndex: 'Mobile',
    //   key: 'Mobile',
    // }
  ];

  // Dynamically create columns from the first student object's keys if students array is not empty
  // This is a more robust way to handle varying API responses.
  const dynamicColumns = students.length > 0
    ? Object.keys(students[0])
        .filter(key => key !== 'id' && key !== '_id') // Exclude 'id' or other internal keys if needed
        .map(key => ({
          title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Format title
          dataIndex: key,
          key: key,
          sorter: (a: Student, b: Student) => {
            const valA = a[key] !== null && a[key] !== undefined ? String(a[key]) : '';
            const valB = b[key] !== null && b[key] !== undefined ? String(b[key]) : '';
            return valA.localeCompare(valB);
          },
        }))
    : columns; // Fallback to predefined columns if no data or for initial render


  if (loading) {
    return <Spin tip="Loading student details..." size="large"><div style={{ padding: 50, background: 'rgba(0, 0, 0, 0.05)', borderRadius: 4 }} /></Spin>;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Student Details from Ghar</Title>
      <Table
        dataSource={students}
        columns={dynamicColumns}
        rowKey="id" // Ensure 'id' is unique and present for each student
        bordered
        size="small"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }} // For horizontal scrolling if many columns
      />
      {students.length === 0 && !loading && <Alert message="No student data found." type="info" />}
    </div>
  );
};

export default StudentDetailsSection;
